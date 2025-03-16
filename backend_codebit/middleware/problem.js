const Problem=require('../models/Problem')
exports.checkProblem = async function(req, res, next) {
    const { title, description, difficulty, tags, inputFormat, outputFormat, examples, constraints } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
    }
    if (!description || description.trim() === '') {
        return res.status(400).json({ message: 'Description is required' });
    }
    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        return res.status(400).json({ message: 'Difficulty is required [Easy , Medium , Hard]' });
    }
    if (!Array.isArray(tags) || tags.length === 0 || tags.some(tag => typeof tag !== 'string')) {
        return res.status(400).json({ message: 'Tags is required and must be a non-empty array of strings' });
    }
    if (typeof inputFormat !== 'string' || inputFormat.trim() === '') {
        return res.status(400).json({ message: 'Input format is required and must be a non-empty string' });
    }
    if (typeof outputFormat !== 'string' || outputFormat.trim() === '') {
        return res.status(400).json({ message: 'Output format is required and must be a non-empty string' });
    }
    if (!Array.isArray(examples) || examples.some(example => 
        typeof example.input !== 'string' || 
        typeof example.output !== 'string' || 
        typeof example.explanation !== 'string')) {
        return res.status(400).json({ message: 'Examples is required and must be an array of objects with "input", "output", and "explanation" properties' });
    }
    if (typeof constraints !== 'string') {
        return res.status(400).json({ message: 'Constraints should be a string' });
    }

    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
        return res.status(400).json({ message: 'A problem with this title already exists' });
    }

    next();
}
