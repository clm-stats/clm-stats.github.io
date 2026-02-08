{
  name = "midlane-cv";
  version = "0.0.1-0";
  mkBuildInputs = env: [env.jekyll];
  mkLuaDeps = env: [
    (env.lua-__.mkPkg env.pkgs)
    env.luaPackages.rapidjson
  ];
}
