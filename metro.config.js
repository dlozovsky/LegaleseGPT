const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Map old React Native internal module paths (used by @rork-ai/toolkit-sdk)
// to their new locations in React Native 0.79.x
const RN_INTERNAL_REDIRECTS = {
  "react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint":
    "react-native/src/private/inspector/getInspectorDataForViewAtPoint",
  "react-native/src/private/devsupport/devmenu/elementinspector/InspectorOverlay":
    "react-native/src/private/inspector/InspectorOverlay",
};

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const redirect = RN_INTERNAL_REDIRECTS[moduleName];
  if (redirect) {
    moduleName = redirect;
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
