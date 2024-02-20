import core from "@actions/core";
import generator from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";

try {
  async function run() {
    const filePath = "./app.config.js";

    // Read the file content
    const code = fs.readFileSync(filePath, "utf-8");

    // Parse the code into an AST (Abstract Syntax Tree)
    const ast = parser.parse(code, {
      sourceType: "module",
    });

    // Update the AST
    traverse.default(ast, {
      enter(path) {
        // Update ios build number
        if (
          path.node.type === "ObjectProperty" &&
          path.node.key.type === "Identifier" &&
          path.node.key.name === "buildNumber" &&
          path.parentPath.node.type === "ObjectExpression" &&
          path.parentPath.parentPath.node.type === "ObjectProperty" &&
          path.parentPath.parentPath.node.key.type === "Identifier" &&
          path.parentPath.parentPath.node.key.name === "ios"
        ) {
          path.node.value.value = (
            parseFloat(path.node.value.value) + 1
          ).toString();
        }

        // Update android version code
        if (
          path.node.type === "ObjectProperty" &&
          path.node.key.type === "Identifier" &&
          path.node.key.name === "versionCode" &&
          path.parentPath.node.type === "ObjectExpression" &&
          path.parentPath.parentPath.node.type === "ObjectProperty" &&
          path.parentPath.parentPath.node.key.type === "Identifier" &&
          path.parentPath.parentPath.node.key.name === "android"
        ) {
          path.node.value.value = (
            parseFloat(path.node.value.value) + 1
          ).toString();
        }
      },
    });

    // Generate updated code from the modified AST
    const updatedCode = generator.default(ast).code;
    console.log("Updated code:", updatedCode);

    // Write the updated code back to the file
    fs.writeFileSync(filePath, updatedCode);

    console.log("File updated successfully!");
  }
  run();
} catch (e) {
  core.setFailed(e.message);
}
