---
title: Deepin 服务框架使用指南
date: 2023-01-18 09:16:12
tags:
  - Linux
  - Service
categories:
  - Deepin
cover: https://pic.3gbizhi.com/2019/0912/20190912025701205.jpg
feature: false
---

本篇文章将介绍 Deepin 后端服务框架如何使用，主要实现两个部分：一个接口，一个配置。

## 概述和用法

### 核心功能

- 插件服务，把服务以一个插件方式加载运行
- dbus接口私有化（接口隐藏、接口白名单）
- dbus插件服务的按需启动
- 独立应用的dbus接口私有化sdk

### 服务加载插件流程

![加载插件流程](/rc/img/deepin_service_manager_use.drawio.svg)

1. 如图所示，服务框架（以下简称 service）由 systemd 服务拉起来；
2. service 起来后读取所有的 json 配置文件，根据配置文件进行分组；
3. 按照分好的组启动子进程，并传入组名；
4. 子进程启动，按照传入的组名进行过滤，注册该组的服务，并且根据配置文件（Resident、OnDemand）决定是否立即加载 so 插件。

### 无接口私有化功能的插件开发

#### 提供配置文件

```json
{
    "name": "org.deepin.service.demo", // dbus name，框架中会注册该name
    "libPath": "demo.so" // 插件so名称
    "group": "core" // 可选，插件按进程分组，默认分组为 core
}
```

配置文件安装路径规则：

:::details qdbus
**system**:
```shell
/usr/share/deepin-service-manager/system/qt-service/demo.json
```
**session**:
```shell
/usr/share/deepin-service-manager/user/qt-service/demo.json
```
:::

:::details sdbus
**system**:
```shell
/usr/share/deepin-service-manager/system/sd-service/demo.json
```
**session**:
```shell
/usr/share/deepin-service-manager/user/sd-service/demo.json
```
:::

:::details sdk
目前只实现了 Qt 的 SDK 实现方式：

```shell
/usr/share/deepin-service-manager/other/qt-service/demo.json
```
> 该功能暂未开放
:::

#### 实现入口函数

:::details qdbus
```cpp
#include "service.h" // 实现的dbusobject，基本支持qdbus原规则
#include <QDBusConnection>

// name:dbus name,配置文件中的"name"，
// data:自定义数据
extern "C" int DSMRegisterObject(const char *name, void *data)
{
    QDBusConnection::RegisterOptions opts = QDBusConnection::ExportAllSlots | QDBusConnection::ExportAllSignals | QDBusConnection::ExportAllProperties;

    // 入口函数，使用name的connectToBus
    QDBusConnection::connectToBus(QDBusConnection::SessionBus, QString(name)).registerObject("/org/deepin/services/demo1", new Service(), opts);
    return 0;
}
```
:::

:::details sdbus
```c
#include "service.h"
extern "C" int DSMRegisterObject(const char *name, void *data)
{
    if (!data) {
        return -1;
    }
    sd_bus *bus = (sd_bus *)data;
    sd_bus_slot *slot = NULL;
    if (sd_bus_add_object_vtable(bus, &slot,
                                    "/org/deepin/services/sdbus/demo1",
                                    "org.deepin.services.sdbus.demo1",
                                    calculator_vtable,
                                    NULL) < 0) {
        return -1;
    }
    return 0;
}
```
:::

**实现的 so 安装路径为 `/usr/lib/deepin-service-manager/`**

> 注意：不同平台的 lib 路径可能不一样，推荐使用[GNUInstallDirs](https://cmake.org/cmake/help/latest/module/GNUInstallDirs.html?highlight=gnuinstalldirs)

### 有接口私有化功能的插件开发

配置文件增加权限规则即可。

```json
{

    "name": "org.deepin.services.demo",
    "libPath": "demo.so",
    "group": "core", // 可选，默认core。
    "policyVersion": "1.0", // 可选，配置文件版本，预留配置，无实际用途
    "policyStartType": "Resident", // 启动方式，Resident（常驻）、OnDemand（按需启动）。可选，默认Resident。

    "whitelists": [ // 白名单规则，给下面 policy 做权限规则配置
        {
            "name": "w1",
            "process": ["/usr/bin/aaa", "/usr/bin/bbb"]
        },
        {
            "name": "w2",
            "process": ["/usr/bin/aaa", "/usr/bin/ccc", "/usr/bin/python3"]
        },
        {
            "name": "all",
            "description": "No configuration is required, which means no restrictions"
        }
    ],
    "policy": [
        {
            "path": "/qdbus/demo1",
            "pathhide": true, // 隐藏该path，但可调用。可选，默认false
            "permission": true, // 开启权限。可选，默认false。注意该功能在 V20 上不可用，V23可正常使用，原因是Qt的DBus实现有问题。
            "subpath": true, // 子path也应用该权限（针对动态生成的子路径）。可选，默认false
            "whitelist": "w1", // 开启权限后，调用上方的白名单规则
            // path->interfaces->methods，权限层级，未指定的下级继承上级的权限配置，指定了的覆盖上级配置
            "interfaces": [
                {
                    "interface": "org.deepin.service.demo",
                    "whitelist": "w1",
                    // "permission":true, // 不填则继承上级PATH的配置
                    "methods": [
                        {
                            "method": "Multiply", // 具体方法的权限管控
                            "whitelist": "w2"
                        }
                    ],
                    "properties": [
                        {
                            "property": "Age",
                            "permission": false
                        }
                    ]
                }
            ]
        },
        {
            "path": "/qdbus/demo2", // 此配置只隐藏路径, 不做权限管控，适合 V20 使用
            "pathhide": true
        }
    ]
}
```
### 独立应用开发

> 此功能暂未开放

1. 提供配置文件，配置规则同上。
2. 加载libqdbus-service.so
3. dbus object继承QDBusService，且调用QDBusService::InitPolicy。

```c++
#include "qdbusservice.h"
#include <QDBusContext>
class Service : public QDBusService,
                protected QDBusContext
{
    Q_OBJECT
public:
    explicit Service(QObject *parent = 0) {
        QDBusService::InitPolicy(QDBusConnection::SessionBus, "other/qt-service/demo.json");
    }
}
```
