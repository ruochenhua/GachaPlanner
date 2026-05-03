#!/bin/bash
# 快速启动微信开发者工具并打开当前项目
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project "$(dirname "$0")"
