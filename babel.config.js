module.exports = {
  "plugins": [
    [
      "module-resolver",
      {
        "root": [
          "./"
        ],
        "alias": {
          "@/*": "./*",
          "@/src/*": "./src/*",
          "@/modules/*": "./src/modules/*",
          "@/shared/*": "./src/shared/*",
          "@/core/*": "./src/core/*"
        }
      }
    ]
  ]
}