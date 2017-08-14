import * as buildTools from "demurgos-web-build-tools";
import * as gulp from "gulp";
import * as typescript from "typescript";

const project: buildTools.Project = {
  root: __dirname,
  packageJson: "package.json",
  buildDir: "build",
  distDir: "dist",
  srcDir: "src",
};

const lib: buildTools.LibTarget = {
  name: "lib",
  srcDir: "src/lib",
  scripts: ["**/*.ts"],
  mainModule: "index",
  dist: true,
  tscOptions: {
    skipLibCheck: true,
  },
};

buildTools.registerLibTargetTasks(gulp, project, lib);

// `lib-test` target
const libTestTarget: buildTools.TestTarget = {
  ...buildTools.LIB_TEST_TARGET,
  name: "test",
  scripts: ["test/**/*.ts", "lib/**/*.ts"],
  typescript: {
    compilerOptions: {
      skipLibCheck: true,
    },
    typescript: typescript,
    tsconfigJson: ["test/tsconfig.json"],
  },
};

buildTools.projectTasks.registerAll(gulp, project);
buildTools.targetGenerators.test.generateTarget(gulp, project, libTestTarget);

gulp.task("all:tsconfig.json", gulp.parallel("lib:tsconfig.json", "test:tsconfig.json"));
gulp.task("all:dist", gulp.parallel("lib:dist"));
