const TestCase = require('../models/TestCases');

exports.addTestCase = async function (req, res) {
    try {
        const { ProblemId,title, TestCases } = req.body;

        if (!ProblemId || !title) {
            return res.status(400).json({ success: false, message: "ProblemId is required" });
        }
        if (!TestCases || !Array.isArray(TestCases) || TestCases.length === 0) {
            return res.status(400).json({ success: false, message: "Test cases are required" });
        }

        const existingProblem = await TestCase.findOne({ problem: ProblemId });

        if (existingProblem) {
            const existingInputs = existingProblem.TestCases.map(tc => tc.Input);
            const filteredTestCases = TestCases.filter(tc =>
                !existingInputs.includes(tc.Input) ||
                !existingProblem.TestCases.some(existingTc =>
                    existingTc.Input === tc.Input &&
                    JSON.stringify(existingTc.ExpectedOutputs) === JSON.stringify(tc.ExpectedOutputs)
                )
            );

            if (filteredTestCases.length > 0) {
                existingProblem.TestCases.push(...filteredTestCases);
                await existingProblem.save();
                return res.status(200).json({
                    success: true,
                    message: "New test cases added to the existing problem",
                    data: existingProblem
                });
            } else {
                return res.status(400).json({ success: false, message: "Test Cases already exist" });
            }
        } else {
            const addedTestcase = await TestCase.create({ problem: ProblemId,title: title, TestCases });
            return res.status(200).json({
                success: true,
                message: "Test cases added successfully",
                addedTestcase
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in adding test case",
            error: error.message
        });
    }
};
