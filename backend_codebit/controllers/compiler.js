const { generateFile } = require("../controllers/generateFile");
const {executeCpp}=require("./executeCpp");
exports.executeCode = async (req, res) => {
    try {
        const { code, language,input } = req.body;
        if (!code || !language||input==undefined) {
            return res.status(400).json({
                success: false,
                message: "all fields are mandatory",
            });
        }    
const filepath = await generateFile(language, code);
try{
const Op=await executeCpp(filepath,input);
const output=Op.output;
        return res.status(200).json({
            success: true,
            message: "Code executed successfully",
            filepath,
            output,
            code,
            language,
            input
        });
    }catch (executionError) {
        let message="Error executing code";
        let details="";
        if(executionError.error=='Compilation error') {message=executionError.error; details=executionError.stderr};
        if(executionError.error=='Execution timed out. Possible infinite loop.') {message=executionError.error; };
        if(executionError.error=='Runtime error') {message=executionError.error; };
     
        return res.status(400).json({
            success: false,
            message,
            details
        });
    }
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: "Error executing code",
            error,
        });
    }
}






