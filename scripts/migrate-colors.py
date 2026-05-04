#!/usr/bin/env python3
"""
硬编码颜色迁移脚本
基于 CSS 属性上下文做智能映射替换
"""

import re
import os
import glob

# 精确的字面量替换（不含正则）
LITERAL_REPLACEMENTS = {
    # 背景
    'background: #FFFFFF;': 'background: var(--color-bg-card);',
    'background-color: #FFFFFF;': 'background-color: var(--color-bg-card);',
    'background: #FAF9F7;': 'background: var(--color-bg-page);',
    'background-color: #FAF9F7;': 'background-color: var(--color-bg-page);',
    'background: #F5F3F0;': 'background: var(--color-gray-100);',
    'background-color: #F5F3F0;': 'background-color: var(--color-gray-100);',
    'background: #C4A77D;': 'background: var(--color-primary);',
    'background-color: #C4A77D;': 'background-color: var(--color-primary);',
    'background: #D4BC99;': 'background: var(--color-primary-light);',
    'background-color: #D4BC99;': 'background-color: var(--color-primary-light);',
    'background: #E5E0D8;': 'background: var(--color-border-divider);',
    'background-color: #E5E0D8;': 'background-color: var(--color-border-divider);',
    'background: #E8E4DE;': 'background: var(--color-border-divider);',
    'background-color: #E8E4DE;': 'background-color: var(--color-border-divider);',
    'background: #FAFAFA;': 'background: var(--color-bg-page);',
    'background: #F5F5F5;': 'background: var(--color-gray-100);',
    'background: #F0F0F0;': 'background: var(--color-gray-100);',
    'background: #F0F7EC;': 'background: var(--color-state-success-bg);',
    'background: #FDF6E3;': 'background: var(--color-state-warning-bg);',
    'background: #FDE8E8;': 'background: var(--color-state-error-bg);',
    'background: #F0E6D6;': 'background: var(--color-primary-light);',

    # 文字
    'color: #2C2520;': 'color: var(--color-text-primary);',
    'color: #1F1B18;': 'color: var(--color-text-primary);',
    'color: #3D3833;': 'color: var(--color-text-primary);',
    'color: #4A4A4A;': 'color: var(--color-text-primary);',
    'color: #7A7168;': 'color: var(--color-text-secondary);',
    'color: #8B8680;': 'color: var(--color-text-secondary);',
    'color: #57534E;': 'color: var(--color-text-secondary);',
    'color: #6B6B6B;': 'color: var(--color-text-secondary);',
    'color: #9C9285;': 'color: var(--color-text-muted);',
    'color: #A8A095;': 'color: var(--color-text-muted);',
    'color: #9B9B9B;': 'color: var(--color-text-muted);',
    'color: #999;': 'color: var(--color-text-muted);',
    'color: #999999;': 'color: var(--color-text-muted);',
    'color: #C4A77D;': 'color: var(--color-primary);',
    'color: #FFFFFF;': 'color: var(--color-text-inverse);',
    'color: white;': 'color: var(--color-text-inverse);',
    'color: #fff;': 'color: var(--color-text-inverse);',
    'color: #7FB069;': 'color: var(--color-success);',
    'color: #E4C786;': 'color: var(--color-warning);',
    'color: #C47070;': 'color: var(--color-danger);',

    # 边框
    'border: 1px solid #E5E0D8;': 'border: 1px solid var(--color-border-divider);',
    'border: 1px solid #E8E4DE;': 'border: 1px solid var(--color-border-divider);',
    'border: 2rpx solid #E5E0D8;': 'border: 2rpx solid var(--color-border-divider);',
    'border: 2rpx solid #C4A77D;': 'border: 2rpx solid var(--color-primary);',
    'border: 2rpx dashed #C4A77D;': 'border: 2rpx dashed var(--color-primary);',
    'border-top: 2rpx solid #E5E0D8;': 'border-top: 2rpx solid var(--color-border-divider);',
    'border-bottom: 1px solid #E5E0D8;': 'border-bottom: 1px solid var(--color-border-divider);',
    'border-left: 3px solid #C47070;': 'border-left: 3px solid var(--color-danger);',
    'border-left: 3px solid #E4C786;': 'border-left: 3px solid var(--color-warning);',
    'border-top: 1px solid #E5E5E5;': 'border-top: 1px solid var(--color-border-divider);',
    'border: 3px solid #E5E0D8;': 'border: 3px solid var(--color-border-divider);',
    'border-top-color: #C4A77D;': 'border-top-color: var(--color-primary);',
    'border: 2rpx solid #E8E4DE;': 'border: 2rpx solid var(--color-border-divider);',

    # box-shadow 中的硬编码 rgba
    'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);': 'box-shadow: 0 2px 8px var(--color-shadow);',
    'box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);': 'box-shadow: 0 2rpx 8rpx var(--color-shadow);',
    'box-shadow: 0 4rpx 16rpx rgba(196, 167, 125, 0.15);': 'box-shadow: 0 4rpx 16rpx var(--color-shadow);',
}

def migrate_file(filepath):
    """迁移单个文件的硬编码颜色"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    replacements_count = 0

    for old, new in LITERAL_REPLACEMENTS.items():
        count = content.count(old)
        if count > 0:
            content = content.replace(old, new)
            replacements_count += count

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return replacements_count
    return 0

def main():
    files = []
    files.extend(glob.glob('pages/*/*.wxss'))
    files.extend(glob.glob('components/*/*.wxss'))
    files.extend(['styles/common.wxss', 'styles/theme.wxss'])

    total_replacements = 0
    migrated_files = 0

    for filepath in files:
        if not os.path.exists(filepath):
            continue
        count = migrate_file(filepath)
        if count > 0:
            print(f"  {filepath}: {count} replacements")
            total_replacements += count
            migrated_files += 1

    print(f"\nTotal: {total_replacements} replacements in {migrated_files} files")

    # 统计剩余硬编码颜色行数
    remaining = 0
    for filepath in files:
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r') as f:
            content = f.read()
        lines = content.split('\n')
        for line in lines:
            stripped = line.strip()
            if '#' in stripped or 'rgba' in stripped or 'rgb(' in stripped:
                if 'var(--' not in stripped and '--color-' not in stripped and '--gray-' not in stripped:
                    if 'url(' not in stripped and not stripped.startswith('/*'):
                        remaining += 1

    print(f"Remaining hard-coded color lines: ~{remaining}")

if __name__ == '__main__':
    main()
