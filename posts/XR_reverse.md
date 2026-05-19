# XR 软件逆向分析流程记录

> 说明：本文只讨论授权安全研究、企业合规审计、自有项目调试和兼容性排查。XR 软件可能涉及空间定位、手势、麦克风、摄像头、账号和设备信息等敏感数据，分析时应严格遵守授权边界。  

## 整体思路

普通 Unity IL2CPP 程序主要看脚本逻辑和资源加载。XR 软件还要额外关注设备运行时和交互链路。  

一个 Unity XR 应用通常可以拆成下面几条线：  

```text
Unity XR 应用
    │
    ├── IL2CPP 层
    │   ├── GameAssembly.dll / libil2cpp.so
    │   ├── global-metadata.dat
    │   ├── 业务脚本
    │   └── XR 封装逻辑
    │
    ├── Unity XR 框架层
    │   ├── XRGeneralSettings
    │   ├── XRManagerSettings
    │   ├── XRInputSubsystem
    │   ├── XRDisplaySubsystem
    │   └── XR Interaction Toolkit
    │
    ├── 设备 SDK 层
    │   ├── OpenXR
    │   ├── Oculus / Meta XR
    │   ├── PICO SDK
    │   ├── SteamVR
    │   └── Wave XR
    │
    └── 平台层
        ├── AndroidManifest.xml
        ├── Java / Kotlin Activity
        ├── native loader
        ├── 权限声明
        └── 设备运行时服务
```

## 常用工具

| 工具 | 用途 | 地址 |
| --- | --- | --- |
| Il2CppDumper | 元数据解析 | https://github.com/Perfare/Il2CppDumper |
| Il2CppInspector | 结构恢复 | https://github.com/djkaty/Il2CppInspector |
| Cpp2IL | IL 恢复 | https://github.com/SamboyCoding/Cpp2IL |
| IDA | 原生分析 | https://hex-rays.com/ida-pro/ |
| Ghidra | 原生分析 | https://github.com/NationalSecurityAgency/ghidra |
| Frida | 动态 Hook | https://github.com/frida/frida |
| apktool | APK 解包 | https://github.com/iBotPeaches/Apktool |
| jadx | DEX 反编译 | https://github.com/skylot/jadx |
| AssetStudio | 资源提取 | https://github.com/Perfare/AssetStudio |
| UABEA | 资源编辑 | https://github.com/nesrak1/UABEA |
| adb logcat | 日志观察 | Android SDK Platform Tools |

## 提取关键文件

Android XR 应用最常见，例如 Quest、PICO、一体机类设备：  

```text
apk_out/
├── AndroidManifest.xml
├── lib/
│   ├── arm64-v8a/
│   │   ├── libil2cpp.so
│   │   ├── libopenxr_loader.so
│   │   └── 其他 SDK so
│   └── armeabi-v7a/
├── assets/
│   └── bin/
│       └── Data/
│           ├── Managed/
│           │   └── Metadata/
│           │       └── global-metadata.dat
│           ├── Resources/
│           ├── StreamingAssets/
│           └── boot.config
└── classes.dex
```

Windows XR 应用常见结构：  

```text
App.exe
GameAssembly.dll
UnityPlayer.dll
App_Data/
├── il2cpp_data/
│   └── Metadata/
│       └── global-metadata.dat
├── Plugins/
├── Resources/
└── StreamingAssets/
```

先解包：  

```bash
apktool d xr_app.apk -o apk_out
```

如果只是拿 IL2CPP 文件，也可以直接解压 APK：  

```bash
unzip xr_app.apk -d apk_unzip
```

提取两个核心文件：  

```text
lib/arm64-v8a/libil2cpp.so
assets/bin/Data/Managed/Metadata/global-metadata.dat
```

XR 一体机基本都是 64 位优先，实际分析时优先看 `arm64-v8a`。  

## 判断 XR 技术栈

先看软件用到的后端技术栈，不同 SDK 的入口和数据结构不一样。  

可以从文件名、Manifest、类名、字符串几个方向判断。  

### 1. so 文件

so 文件是最快的判断入口。看到 `libopenxr_loader.so`，基本可以对应用到了 **OpenXR**； `libOVRPlugin.so`对应 **Oculus XR**； `libpxr_api.so` 或 `libPicoXRPlugin.so`对应 **PICO SDK**； `libwave_api.so`对应 **Vive Wave**； `libsteam_api.so`对应 **SteamVR**。  

### 2. Unity 类名

在 `dump.cs` 或 DummyDll 中，优先搜 `XRGeneralSettings`、`XRManagerSettings`、`XRInputSubsystem`、`XRDisplaySubsystem` 这一组 Unity XR Plugin Management 相关类；  

**OpenXR** 项目看 `OpenXRSettings`、`OpenXRFeature`；**Oculus** 项目看 `OVRManager`、`OVRInput`、`OVRCameraRig`；**PICO** 项目看 `PXR_Manager`、`PXR_Input`；如果出现 `XRGrabInteractable`、`XRRayInteractor`、`TeleportationProvider`、`InputAction`，通常说明项目接入了 XR Interaction Toolkit 或者 Unity Input System。  

### 3. Manifest

Quest 应用中可能看到：  

```xml
<uses-feature android:name="oculus.software.handtracking" android:required="false" />
<uses-feature android:name="com.oculus.feature.PASSTHROUGH" android:required="false" />
```

PICO 应用中可能看到：  

```xml
<uses-feature android:name="pvr.sdk" android:required="true" />
```

OpenXR 应用可能不会在 Manifest 里写出来，需要结合 so 和 Unity 设置判断。  

### 4. boot.config

Unity 的 `boot.config` 有时能看到图形 API、XR 相关配置：  

```text
gfx-enable-gfx-jobs=1
vr-enabled=1
```

不过不同 Unity 版本和 XR Plugin Management 配置会有差异，还要结合其他来判断。  

## 解析 IL2CPP 元数据

使用 Il2CppDumper：  

```bash
Il2CppDumper.exe libil2cpp.so global-metadata.dat output
```

正常输出：  

```text
output/
├── dump.cs
├── il2cpp.h
├── script.json
├── stringliteral.json
├── ida.py
├── ghidra.py
└── DummyDll/
```

解析完成后，先在 `dump.cs` 里按 XR 语义扫一遍。  

**技术栈**相关搜 `XR`、`OpenXR`、`Oculus`、`OVR`、`PXR`、`Pico`、`SteamVR`；**交互**相关搜 `Hand`、`Controller`、`Ray`、`Grab`、`Teleport`；**空间能力**相关搜 `Tracking`、`Pose`、`Anchor`、`Passthrough`、`Boundary`、`Guardian`。  

如果搜索结果主要集中在 `Unity.XR.*`、`UnityEngine.XR.*`，说明项目可能使用 Unity XR Plugin Management。  

如果出现大量 `OVR*`，偏向 Oculus SDK。  

如果出现大量 `PXR_*`，偏向 PICO SDK。  

如果出现 `XRGrabInteractable`、`XRRayInteractor`、`ActionBasedController`，说明项目可能使用 XR Interaction Toolkit。  

## 导入 Ghidra 并校验地址

Ghidra 中导入 `libil2cpp.so` 后运行 `ghidra.py`，IDA同理。  

导入后先不看逻辑，先校验几个简单函数再说。比如：  

```csharp
public Transform get_transform() { }
public bool get_isActiveAndEnabled() { }
public Vector3 get_position() { }
public Quaternion get_rotation() { }
```

如果 `dump.cs` 中方法地址是：  

```csharp
// RVA: 0x1A2B3C Offset: 0x1A1B3C VA: 0x1A2B3C
public Vector3 GetControllerPosition() { }
```

运行时地址计算：  

```javascript
const il2cpp = Process.findModuleByName("libil2cpp.so");
const addr = il2cpp.base.add(0x1A2B3C);
console.log(addr);
```

## 找初始化入口

Unity XR Plugin Management 常见初始化链是 `XRGeneralSettings` 到 `Manager`，再进入 `XRManagerSettings`，从 `activeLoaders` 里选择 loader，最后走 `InitializeLoader` 和 `StartSubsystems`。  

可以在 `dump.cs` 中找：  

```csharp
public class XRGeneralSettings
{
    public XRManagerSettings Manager;
}

public class XRManagerSettings
{
    public List<XRLoader> activeLoaders;
    public void InitializeLoaderSync() { }
    public IEnumerator InitializeLoader() { }
    public void StartSubsystems() { }
    public void StopSubsystems() { }
}
```

**OpenXR** 方向看 `UnityEngine.XR.OpenXR.OpenXRSettings`、`OpenXRFeature` 和 `UnityEngine.XR.OpenXR.Features`。**Oculus** 方向看 `OVRManager`、`OVRPlugin`、`OVRInput`、`OVRCameraRig`、`OVRHand`、`OVRSkeleton`、`OVRPassthroughLayer`。**PICO** 方向看 `PXR_Manager`、`PXR_Input`、`PXR_HandTracking`、`PXR_Boundary`、`PXR_Plugin`。  

这些初始化入口可以确定 XR runtime 的启动方式以及使用的能力。  

## 分析位姿（pose）

XR 软件最核心的数据之一是 pose，通常围绕 `position`、`rotation`、`velocity`、`angularVelocity`、`trackingState` 展开。Unity 层常见类型包括 `UnityEngine.Vector3`、`UnityEngine.Quaternion`、`UnityEngine.XR.InputDevice`、`UnityEngine.XR.InputTracking`、`UnityEngine.XR.XRNode`、`XRNodeState`、`InputFeatureUsage`。  

定位 pose 读取逻辑时，可以搜 `GetNodeStates`、`GetLocalPosition`、`GetLocalRotation`、`TryGetFeatureValue`、`centerEye`、`leftHand`、`rightHand`、`Head`。如果项目用了 XR Interaction Toolkit，还要关注 `XROrigin`、`CameraOffset`、`Main Camera`、`LeftHand Controller`、`RightHand Controller`、`ActionBasedController`、`XRController`。  

如果业务函数中频繁读写 `Transform.position`、`Transform.rotation`，不要只看 API 名，要确认这个 Transform 对应的是 `头显 Camera`、`左手柄 Controller`、`右手柄 Controller`、`被抓取物体`，还是 `射线命中目标`。  

一个常见伪代码：  

```c
void __fastcall HandTracker_Update(__int64 this, MethodInfo *method)
{
    Vector3 pos;
    Quaternion rot;

    XRInput_GetRightHandPose(&pos, &rot);
    Transform_set_position(*(_QWORD *)(this + 0x30), pos);
    Transform_set_rotation(*(_QWORD *)(this + 0x30), rot);
}
```

对照字段：  

```csharp
public class HandTracker
{
    public Transform rightHandModel; // 0x30
}
```

可以判断该函数把右手柄 pose 同步到手部模型。  

注意：Unity 的 `Vector3` 和 `Quaternion` 是值类型，传参和返回值在不同平台上可能会被 ABI 改写成隐藏指针，这里可能会混淆反编译器的初始签名。  

## 分析 XR 输入

XR 输入一般分两套：一套是 `UnityEngine.XR.InputDevice / TryGetFeatureValue`，另一套是 `Unity Input System / InputAction`。  

传统 XR 输入常见调用：  

```csharp
InputDevice.TryGetFeatureValue(CommonUsages.triggerButton, out bool value)
InputDevice.TryGetFeatureValue(CommonUsages.grip, out float value)
InputDevice.TryGetFeatureValue(CommonUsages.primaryButton, out bool value)
```

Input System 里常见对象有 `InputActionAsset`、`InputActionMap`、`InputAction`、`InputActionReference`、`ActionBasedController`。在 `dump.cs` 中可以搜 `trigger`、`grip`、`primaryButton`、`secondaryButton`、`menuButton`、`thumbstick`、`joystick`、`selectAction`、`activateAction`、`uiPressAction`。  

XR Interaction Toolkit 常见字段：  

```csharp
public InputActionProperty selectAction;
public InputActionProperty activateAction;
public InputActionProperty uiPressAction;
public InputActionProperty rotateAnchorAction;
public InputActionProperty translateAnchorAction;
```

按钮逻辑常见形式：  

```c
bool pressed = InputAction_IsPressed(*(_QWORD *)(this + 0x48));
if (pressed)
{
    Interactor_StartGrab(this);
}
```

对照字段：  

```csharp
public class CustomGrabController
{
    public InputActionProperty grabAction; // 0x48
}
```

就可以知道该逻辑和抓取输入相关。  

## 分析射线、抓取和传送

XR 软件的交互逻辑通常集中在 `XRRayInteractor`、`XRDirectInteractor`、`XRGrabInteractable`、`XRSocketInteractor`、`TeleportationProvider`、`TeleportationArea`、`TeleportationAnchor`、`XRInteractorLineVisual`、`TrackedDeviceGraphicRaycaster` 这些组件附近。搜索时优先看 `SelectEnter`、`SelectExit`、`HoverEnter`、`HoverExit`、`ProcessInteractor`、`ProcessInteractable`、`TryGetCurrent3DRaycastHit`、`TryGetCurrentUIRaycastResult`、`Grab`、`Release`、`Teleport`。  

**射线交互：** `ray origin`、`ray direction`、`hit point`、`hit normal`、`hit transform`、`hit distance`、`UI raycast result`  
**抓取逻辑：** `attachTransform`、`movementType`、`trackPosition`、`trackRotation`、`throwOnDetach`、`velocity`、`angularVelocity`  
**传送逻辑：** `destinationPosition`、`destinationRotation`、`matchOrientation`、`teleportRequest`、`locomotionSystem`  

如果要判断一个 XR 软件是否采集了用户交互行为，重点看这些事件是否被进一步写入日志、缓存或网络请求。  

例如：  

```c
void __fastcall Analytics_RecordGrab(__int64 this, __int64 interactable, MethodInfo *method)
{
    String_t *name = Object_get_name(interactable, 0);
    Vector3 pos = Transform_get_position(Object_get_transform(interactable, 0), 0);

    Json_AddString(*(_QWORD *)(this + 0x20), "object", name);
    Json_AddVector3(*(_QWORD *)(this + 0x20), "position", pos);
    HttpClient_Post(*(_QWORD *)(this + 0x28), 0);
}
```

这种函数就值得继续看上报 URL、字段名和触发频率。  

## 第九步：关注 XR 隐私和权限数据

XR 软件比普通手游更容易碰到敏感数据。Android Manifest 里关注：  

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

XR 平台特性：  

```xml
<uses-feature android:name="oculus.software.handtracking" android:required="false" />
<uses-feature android:name="com.oculus.feature.PASSTHROUGH" android:required="false" />
```

重点排查方向是：`手势数据是否上报`、`头显或手柄 pose 是否上报`、`空间锚点是否上传`、`房间边界是否读取`、`麦克风音频是否采集`、`透视能力是否启用`、`设备型号、账号 ID、序列号是否上传`。在 `dump.cs` 和字符串中，可以围绕 `hand`、`gesture`、`tracking`、`anchor`、`boundary`、`guardian`、`passthrough`、`microphone`、`deviceId`、`serial`、`analytics`、`telemetry`、`upload` 这些词继续追。  

谨慎下结论，Manifest 里声明的权限不一定使用，代码里存在 API 调用也不一定上传。主要还是要看触发条件、调用链和网络数据。  

## 动态验证 XR 数据

如果要验证 XR 位姿相关，最好不要改逻辑，只观察就行。  

Frida 计算 IL2CPP 函数运行时地址：  

```javascript
const il2cpp = Process.findModuleByName("libil2cpp.so");
const target = il2cpp.base.add(0x1A2B3C);
console.log("target =", target);
```

读取 `Vector3`：  

```javascript
function readVector3(p) {
    return {
        x: p.readFloat(),
        y: p.add(4).readFloat(),
        z: p.add(8).readFloat()
    };
}
```

读取 `Quaternion`：  

```javascript
function readQuaternion(p) {
    return {
        x: p.readFloat(),
        y: p.add(4).readFloat(),
        z: p.add(8).readFloat(),
        w: p.add(12).readFloat()
    };
}
```

读取 IL2CPP 字符串：  

```javascript
function readIl2CppString(s) {
    if (s.isNull()) return null;

    const len = s.add(Process.pointerSize * 2).readS32();
    const chars = s.add(Process.pointerSize * 2 + 4);
    return chars.readUtf16String(len);
}
```

Hook 示例：  

```javascript
Interceptor.attach(target, {
    onEnter(args) {
        this.self = args[0];
    },
    onLeave(retval) {
        console.log("leave target");
    }
});
```

实际 Hook 时要根据函数签名确认参数位置。实例方法通常 `args[0]` 是 `this`，但静态方法、返回值为大结构体、泛型方法、平台 ABI 都可能影响参数布局。  

验证记录建议至少包含 `样本版本`、`设备型号`、`XR 后端`、`函数 RVA`、`运行时地址`、`输入设备`、`字段偏移`、`观察到的 position/rotation`，以及 `是否进入网络上报路径`。这些信息足够把静态判断和动态现象对起来。  

## 资源分析

资源文件是 unity 软件的特色，可交互对象和场景等都在这里，只看逻辑看不清。  

重点目录：  

```text
assets/bin/Data/
├── Resources/
├── StreamingAssets/
├── sharedassets*.assets
├── level*
└── globalgamemanagers
```

常见资源对象包括 `XR Origin`、`Camera Offset`、`Main Camera`、`LeftHand Controller`、`RightHand Controller`、`XR Interaction Manager`、`Locomotion System`、`Teleportation Area`、`Grab Interactable`、`Canvas + TrackedDeviceGraphicRaycaster`。  

这里用 AssetStudio 工具看预制体对象（`.prefab`）和场景（`.unity`），主要确认 `哪些 GameObject 绑定了自定义 MonoBehaviour`、`脚本对应 dump.cs 中哪个类`、`组件字段里引用了哪些 Transform/Action/Material`，以及 `交互对象是否绑定 Analytics/Logger/Uploader`。  

如果项目使用 Addressables 或 AssetBundle，继续看 `catalog.json`、`settings.json`、`*.bundle`、`*.assets`、`StreamingAssets/aa/`。  

有些 XR 应用会把核心场景、模型、交互配置放在远程资源里，此时只分析 APK 内置资源可能不完整。  

## 热更新和脚本层

XR 应用也常见热更新，常见方案包括 `XLua`、`ToLua`、`ILRuntime`、`HybridCLR`、`Puerts`，资源侧则常见 `Addressables` 和 `AssetBundle`。  

搜索时可以从 `Hotfix`、`LoadAssembly`、`Assembly.Load`、`dll.bytes`、`lua.bytes`、`script`、`bundle`、`catalog` 入手。  

如果 `dump.cs` 里主要是桥接层，真正业务类很少，说明逻辑可能在热更新程序集或脚本里。  

此时 IL2CPP 分析重点会变成 `热更新资源从哪里加载`、`是否解密或解压`、`脚本 API 如何绑定 XR 输入和位姿`、`哪些 native 方法暴露给脚本层`、`脚本层是否处理数据上报`。  

## 参考文献

1. Vivek Nair, Wenbo Guo, Justus Mattern, Rui Wang, James F. O'Brien, Louis Rosenberg, Dawn Song. [Unique Identification of 50,000+ Virtual Reality Users from Head & Hand Motion Data](https://www.usenix.org/conference/usenixsecurity23/presentation/nair-identification). USENIX Security 2023.  
2. Carter Slocum, Yicheng Zhang, Nael Abu-Ghazaleh, Jiasi Chen. [Going through the motions: AR/VR keylogging from user head motions](https://www.usenix.org/conference/usenixsecurity23/presentation/slocum). USENIX Security 2023.  
3. Yicheng Zhang, Carter Slocum, Jiasi Chen, Nael Abu-Ghazaleh. [It's all in your head(set): Side-channel attacks on AR/VR systems](https://www.usenix.org/conference/usenixsecurity23/presentation/zhang-yicheng). USENIX Security 2023.  
4. Habiba Farrukh, Reham Mohamed, Aniket Nare, Antonio Bianchi, Z. Berkay Celik. [LocIn: Inferring Semantic Location from Spatial Maps in Mixed Reality](https://www.usenix.org/conference/usenixsecurity23/presentation/farrukh). USENIX Security 2023.  
5. Yoonsang Kim, Sanket Goutam, Amir Rahmati, Arie Kaufman. [Erebus: Access Control for Augmented Reality Systems](https://www.usenix.org/conference/usenixsecurity23/presentation/kim-yoonsang). USENIX Security 2023.  
6. Sindhu Reddy Kalathur Gopal, Diksha Shukla, James David Wheelock, Nitesh Saxena. [Hidden Reality: Caution, Your Hand Gesture Inputs in the Immersive Virtual World are Visible to All!](https://www.usenix.org/conference/usenixsecurity23/presentation/gopal). USENIX Security 2023.  
7. Kaiming Cheng, Arkaprabha Bhattacharya, Michelle Lin, Jaewook Lee, Aroosh Kumar, Jeffery F. Tian, Tadayoshi Kohno, Franziska Roesner. [When the User Is Inside the User Interface: An Empirical Study of UI Security Properties in Augmented Reality](https://www.usenix.org/conference/usenixsecurity24/presentation/cheng-kaiming). USENIX Security 2024.  
8. Zhuolin Yang, Zain Sarwar, Iris Hwang, Ronik Bhaskar, Ben Y. Zhao, Haitao Zheng. [Can Virtual Reality Protect Users from Keystroke Inference Attacks?](https://www.usenix.org/conference/usenixsecurity24/presentation/yang-zhuolin). USENIX Security 2024.  
9. Anh Nguyen, Xiaokuan Zhang, Zhisheng Yan. [Penetration Vision through Virtual Reality Headsets: Identifying 360-degree Videos from Head Movements](https://www.usenix.org/conference/usenixsecurity24/presentation/nguyen). USENIX Security 2024.  
10. Jiaxun Cao, Abhinaya S. B., Anupam Das, Pardis Emami-Naeini. [Understanding Parents' Perceptions and Practices Toward Children's Security and Privacy in Virtual Reality](https://dblp.org/rec/conf/sp/CaoBDN24). IEEE Symposium on Security and Privacy 2024.  
