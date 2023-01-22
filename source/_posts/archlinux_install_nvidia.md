---
title: ArchLinux 安装NVIDIA驱动
date: 2022-08-05 14:46:32
tags:
  - Linux
categories:
  - ArchLinux
cover: https://pic.3gbizhi.com/2020/1011/20201011011357445.jpg
feature: false
---

Nvidia 的开源驱动是作为逆向工程开发的，性能毕竟比不上闭源驱动，本篇教程将教大家在 ArchLinux 上安装闭源驱动。

## 禁用 nouveau

1. 编辑配置文件，没有则创建：

   ```shell
   sudo vim /etc/modprobe.d/blacklist.conf
   ```

2. 在最后一行添加：

   ```shell
   blacklist nouveau
   ```

3. 生成新的 initrd：

   ```shell
   mkinitcpio -P
   ```

## 重启

1. 执行重启命令：

   ```shell
   reboot
   ```

2. 重启之后查看 nouveau 是否运行，没有输出代表禁用生效：

   ```shell
   lsmod | grep nouveau
   ```

## 停止可视化桌面

1. 如果使用显示管理器，切换到其他 tty 进行关闭，如 lightdm：

   ```shell
   sudo systemctl stop lightdm
   ```

2. 如果直接startx启动图形服务，退出窗口管理器即可，如 openbox 的`Log Out`

## 安装驱动

1. Arch Linux 可以直接安装 Nvidia 驱动：

   ```shell
   sudo pacman -S nvidia
   ```

2. 重启图形服务后检查：

   ```shell
   nvidia-smi
   ```
