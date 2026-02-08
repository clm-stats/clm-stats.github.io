{
  name = "midlane-cv";
  version = "0.0.1-0";
  mkLuaDeps = env: [
    (env.lua-__.mkPkg env.pkgs)
    env.luaPackages.rapidjson
  ];
}
