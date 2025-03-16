// const { exec, execFile } = require("child_process");
// const fs = require("fs");
// const path = require("path");

// const outputPath = path.join(__dirname, "outputs");

// if (!fs.existsSync(outputPath)) {
//   fs.mkdirSync(outputPath, { recursive: true });
// }
// const executeCpp = (filepath, input) => {
//   return new Promise((resolve, reject) => {
//     const jobId = path.basename(filepath).split(".")[0];
//     const outPath = path.join(outputPath, `${jobId}.exe`); 
//     exec(`g++ "${filepath}" -o "${outPath}"`, (compileError, _, compileStderr) => {
//       if (compileError) { 
        
//         return reject({ error: "Compilation error", stderr: compileStderr });
//       }
//       const process = execFile(outPath, { timeout: 2000 }, (error, stdout, stderr) => {   
     
        
        
//         if (error) {
//           if (error.killed) {  
//             return reject({  error: "Execution timed out. Possible infinite loop." });
//           }
//           return reject({ error:"Runtime error", stderr });
//         }
//         if (stderr) {
//           return reject(stderr);
//         }
//         resolve(stdout);
//       });
//       if (input) {
//         process.stdin.write(input + '\n');
//       }
//       process.stdin.end();
//       process.on("exit", () => {
//         setTimeout(() => {
//           try {
//             if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
//             if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
//           } catch (cleanupError) {
//             console.error("Error cleaning up files:", cleanupError);
//           }
//         }, 2000);
//       });
//     });
//   });
// };

// module.exports = { executeCpp };
const { exec, execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, input) => {
  return new Promise((resolve, reject) => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`); 

    // Start compilation
    exec(`g++ "${filepath}" -o "${outPath}"`, (compileError, _, compileStderr) => {
      if (compileError) {
        cleanup(filepath, outPath);
        return reject({ error: "Compilation error", stderr: compileStderr });
      }

      // Measure execution time
      const start = process.hrtime();

      const processExec = execFile(outPath, { timeout: 2000 }, (error, stdout, stderr) => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const executionTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2); // in ms

        cleanup(filepath, outPath);

        if (error) {
          if (error.killed) {
            return reject({ error: "Execution timed out. Possible infinite loop." });
          }
          return reject({ error: "Runtime error", stderr });
        }

        resolve({ output: stdout, executionTime });
      });

      if (input) {
        processExec.stdin.write(input + "\n");
      }
      processExec.stdin.end();
    });
  });
};

// Cleanup function to always delete files
const cleanup = (filepath, outPath) => {
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
  } catch (cleanupError) {
    console.error("Error cleaning up files:", cleanupError);
  }
};

module.exports = { executeCpp };
