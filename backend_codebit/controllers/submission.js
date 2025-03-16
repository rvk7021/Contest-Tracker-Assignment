const Submission = require("../models/Submission");
const TestCase = require("../models/TestCases");
const axios = require("axios");
const User=require('../models/User');
exports.submitCode = async (req, res) => {
    try {
      
        const { title, code ,testCases,problem} = req.body;
  
        if (!title || !code ) {
            return res.status(400).json({ success: false, message: "All fields are mandatory" });
        }

        
     
        if (!testCases) {
            return res.status(404).json({ success: false, message: "Test cases not found" });
        }
       
        

        let allPassed = true;
        let results = [];
  
 
   
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            
            
            const input = testCase.Input;
            const expectedOutput = testCase.ExpectedOutputs.trim();

            const response = await axios.post(`${process.env.EXECUTION_API_URL}/execute`, {
                code,
                input,
                language:"cpp"
            });
           
            const actualOutput = response.data.output.trim();

          
            const passed = actualOutput === expectedOutput;
            results.push({
                input,
                expectedOutput,
                actualOutput,
                passed
            })
            if(!passed)
            {
               
                
                allPassed = false;
               
               
               if(results.length>2) { break;}
            }
         

           
        }
          
        const userId=req.user.id ;
        const user=await User.findById(userId);
         
      const status = allPassed ? "Accepted" : "Wrong Answer";
            const submission = await Submission.create({user:user, title:title, code:code,status:status });
          
            
            if(allPassed){


const topicMap = new Map(user.topics.map(topic => [topic.topicName, topic]));

let alreadyExist=true;
let newTopicCreated=false;

for (let topic of problem.tags) {
    if (!topicMap.has(topic)) {
        topicMap.set(topic, { topicName: topic, problems: [{ problemId: problem._id }] });
        newTopicCreated = true;
    } else {
    
        let userTopic = topicMap.get(topic);

       
        if (!userTopic.problems.some(p => p.problemId.equals(problem._id))) {
            alreadyExist = false;
            userTopic.problems.push({ problemId: problem._id });
        }
    }
}

user.topics = Array.from(topicMap.values());

if((alreadyExist&&newTopicCreated)||(!alreadyExist)){
 user.problemSolved++;

if (problem.difficulty === "Easy") user.Easy++;
else if (problem.difficulty === "Medium") user.Medium++;
else if (problem.difficulty === "Hard") user.Hard++;

}



            }
            const today = new Date().toISOString().split("T")[0]; 

            if (!user.activeDays.includes(today)) {
                user.activeDays.push(today); 
            }

user.SubmissionCount++;

await user.save();

if(allPassed){

            return res.status(200).json({ success: true, message: "Code Accepted Successful",results ,status:status });
        } else {
            return res.status(200).json({ success: true, message: " Code Not Accepted", results });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const title=req.query.title;
        const submissions = await Submission.find({ user: userId,title:title });
        
        return res.status(200).json({ success: true, submissions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// exports.runCode = async (req, res) => {
//     try {
//         const { title, code,test } = req.body;
//         if (!title || !code ) {
//             return res.status(400).json({ success: false, message: "All fields are mandatory" });
//         }
//         if (!test) {
//             return res.status(404).json({ success: false, message: "Test cases not found" });
//         }
//         let results = [];
//         for (let i = 0; i < test.length; i++) {
//             const testCase =    test[i];
//             const input = testCase.Input;
//             const expectedOutput = testCase.ExpectedOutputs.trim();
//             const response = await axios.post(`${process.env.EXECUTION_API_URL}/execute`, {
//                 code,
//                 input,
//                 language:"cpp"
//             });
//             const actualOutput = response.data.output.trim();
//             const passed = actualOutput === expectedOutput;
//             results.push({
//                 input,
//                 expectedOutput,
//                 actualOutput,
//                 passed
//             })
//            }   
//             return res.status(200).json({ success: true, message: "All Test Cases Run Successfully",results });
//         } 
//     catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

exports.runCode = async (req, res) => {
    try {
        const { title, code, test } = req.body;

        if (!title || !code) {
            return res.status(400).json({ success: false, message: "All fields are mandatory" });
        }

        if (!test) {
            return res.status(404).json({ success: false, message: "Test cases not found" });
        }

        // Execute all test cases in parallel
        const executionPromises = test.map(async (testCase) => {
            try {
                const response = await axios.post(`${process.env.EXECUTION_API_URL}/execute`, {
                    code,
                    input: testCase.Input,
                    language: "cpp",
                });

                const actualOutput = response.data.output.trim();
                const expectedOutput = testCase.ExpectedOutputs.trim();
                const passed = actualOutput === expectedOutput;

                return {
                    input: testCase.Input,
                    expectedOutput,
                    actualOutput,
                    passed,
                };
            } catch (error) {
                return {
                    input: testCase.Input,
                    expectedOutput: testCase.ExpectedOutputs.trim(),
                    actualOutput: "Error",
                    passed: false,
                };
            }
        });

        // Wait for all test cases to complete
        const results = await Promise.allSettled(executionPromises);
        const processedResults = results.map((r) =>
            r.status === "fulfilled" ? r.value : { input: "Unknown", expectedOutput: "Unknown", actualOutput: "Error", passed: false }
        );

        return res.status(200).json({ success: true, message: "All Test Cases Run Successfully", results: processedResults });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
