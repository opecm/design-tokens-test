const StyleDictionary = require("style-dictionary");

function getBasePxFontSize(options) {
  return (options && options.basePxFontSize) || 16;
}

console.log("Build started...");
console.log("\n==============================================");

// REGISTER THE CUSTOM TRANFORMS

StyleDictionary.registerTransform({
  name: "size/remToPx",
  type: "value",
  matcher: function (token) {
    return token.attributes.category === "font";
  },
  transformer: function (token, options) {
    const val = parseFloat(token.value);
    const baseFont = getBasePxFontSize(options);
    if (isNaN(val)) throwSizeError(token.name, token.value, "px");
    return (val * baseFont).toFixed(0) + "px";
  },
});

// REGISTER THE CUSTOM TRANFORM GROUPS

StyleDictionary.registerTransformGroup({
  name: "custom/scss",
  transforms: ["attribute/cti", "size/remToPx", "name/cti/kebab", "color/hsl"],
});

// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
const StyleDictionaryExtended = StyleDictionary.extend(
  __dirname + "/config.json"
);

// FINALLY, BUILD ALL THE PLATFORMS
StyleDictionaryExtended.buildAllPlatforms();

console.log("\n==============================================");
console.log("\nBuild completed!");
