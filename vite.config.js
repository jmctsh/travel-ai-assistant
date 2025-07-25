import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import fs from 'fs'
import path from 'path'

// 自定义Vite插件，用于在开发环境中处理数据保存和图片上传
function fileSavePlugin() {
  return {
    name: 'file-save-plugin',
    configureServer(server) {
      // 处理数据保存
      server.middlewares.use('/api/update-data', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const filePath = path.resolve(__dirname, 'public/app-data.json');
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              res.statusCode = 200;
              res.end('保存成功！');
            } catch (e) {
              res.statusCode = 500;
              res.end(`保存失败: ${e.message}`);
            }
          });
        } else {
          next();
        }
      });

      // 处理图片上传
      server.middlewares.use('/api/upload-image', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { imageData, fileName, imageName } = JSON.parse(body);
              
              // 确保uploads文件夹存在
              const uploadsDir = path.resolve(__dirname, 'public/uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              
              // 从Base64数据中提取实际图片数据
              const base64Data = imageData.split(';base64,').pop();
              const filePath = path.join(uploadsDir, fileName);
              
              // 写入文件
              fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
              
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                url: `/uploads/${fileName}`,
                name: imageName || fileName.split('.')[0]
              }));
            } catch (e) {
              console.error('图片上传失败:', e);
              res.statusCode = 500;
              res.end(`图片上传失败: ${e.message}`);
            }
          });
        } else {
          next();
        }
      });
      
      // 处理图片删除
      server.middlewares.use('/api/delete-image', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { fileName } = JSON.parse(body);
              
              // 安全检查：确保文件名不包含路径操作符
              if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
                throw new Error('无效的文件名');
              }
              
              const filePath = path.resolve(__dirname, 'public/uploads', fileName);
              
              // 检查文件是否存在
              if (fs.existsSync(filePath)) {
                // 删除文件
                fs.unlinkSync(filePath);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true }));
              } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ success: false, message: '文件不存在' }));
              }
            } catch (e) {
              console.error('删除图片失败:', e);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, message: e.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    fileSavePlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
