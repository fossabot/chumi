import type { Plugin } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

export default function compressServerCode() {
  return {
    name: 'compress-server-code',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      await new Promise((resolve) => {
        const run = spawn(path.join(__dirname, '..', 'node_modules/.bin/tsc'), {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit'
        });
        run.on('close', resolve);
      });

      fs.removeSync(path.join(__dirname, '..', 'lib', '.tsbuildinfo'));

      const version = require(path.join(__dirname, '..', 'package.json')).version;

      /**
       * 写入package.json
       */
      fs.writeFileSync(
        path.join(__dirname, '..', 'lib', 'package.json'),
        JSON.stringify({
          name: 'chumi',
          version,
          main: 'index.js',
          types: 'types/index.d.ts',
          dependencies: {
            koa: '^2.14.1',
            'koa-body': '^5.0.0',
            'koa-compose': '^4.1.0',
            'koa-router': '^10.1.1'
          },
          peerDependencies: {
            koa: '^2.14.1',
            'koa-body': '^5.0.0',
            'koa-compose': '^4.1.0',
            'koa-router': '^10.1.1'
          }
        })
      );

      /**
       * 写入markdown
       */
      fs.writeFileSync(
        path.join(__dirname, '..', 'lib', 'readme.md'),
        `# Chumi · [![NPM version](https://img.shields.io/npm/v/chumi.svg)](https://www.npmjs.com/package/chumi)  · [Document](https://ph9o1wkcdp.feishu.cn/docx/UGCfdJVisokyQLxi2Rocuy4fn7f)

![image.png](https://s1.ax1x.com/2023/03/07/ppeFpUP.png)`
      );

      await new Promise((resolve) => {
        const run = spawn('npm', ['publish', '--registry', 'https://registry.npmjs.org'], {
          cwd: path.join(__dirname, '..', 'lib'),
          stdio: 'inherit'
        });
        run.on('close', resolve);
      });
    }
  } as Plugin;
}
