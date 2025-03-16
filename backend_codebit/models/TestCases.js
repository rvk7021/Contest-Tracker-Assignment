const mongoose = require('mongoose');

const TestCasesSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    title:{
        type:String,
        required:true
    },
    TestCases: [
        {
            Input: {
                type: String,
                required: true,
                trim: true
            },
            ExpectedOutputs: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) {
                     return v.length > 0;
                    }
                
            }
        }
        }
    ],
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    }
});


const TestCases = mongoose.model('TestCases', TestCasesSchema);

module.exports = TestCases;
