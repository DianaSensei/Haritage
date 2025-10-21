module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@/*": "./*",
            "@/src/*": "./src/*",
            "@/modules/*": "./src/modules/*",
            "@/shared/*": "./src/shared/*",
            "@/core/*": "./src/core/*",
          },
        },
      ],
      // react-native-reanimated plugin must be last
      "react-native-reanimated/plugin",
    ],
  };
};
