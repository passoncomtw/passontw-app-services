const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. 監聽 pkg 目錄的變化
config.watchFolders = [workspaceRoot];

// 2. 讓 Metro 能夠解析 node_modules（包括 workspace root 的）
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. 配置額外的解析路徑
config.resolver.extraNodeModules = {
  '@pkg': path.resolve(workspaceRoot, 'pkg'),
};

module.exports = config;

