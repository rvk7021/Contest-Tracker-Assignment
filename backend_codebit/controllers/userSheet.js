const express = require('express');
const app = express();
require('dotenv').config();
const Sheet = require('../models/Sheet');
const Problem = require('../models/Problem');
// Check sheet API call if it exists or not, then create one

exports.CheckSheet = async (req, res) => {
  try {
    let user = req.user.id;
    if (!user) {
      return res.status(400).json({
        message: "User ID is required",
        success: false
      });
    }

    let sheetData = await Sheet.findOne({ user });

    if (!sheetData) {
      return res.status(404).json({
        message: "Sheet does not exist",
        success: false
      });
    }

    return res.status(200).json({
      message: "Sheet exists",
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

exports.CreateSheet = async (req, res) => {
  try {
    let user = req.user.id;
    console.log("User:", user);
    if (!user) {
      return res.status(400).json({
        message: "User ID is required",
        success: false
      });
    }
    let newSheet = await Sheet.create({ user });

    if (newSheet) {
      return res.status(201).json({
        message: "Sheet created successfully",
        success: true
      });
    } else {
      return res.status(500).json({
        message: "Failed to create sheet",
        success: false
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

// Sheet Deletion API call
exports.DeleteSheet = async (req, res) => {
  try {
    let user = req.user.id;
    console.log("User:", user);
      if (!user) {
      return res.status(400).json({
        message: "User ID is required",
        success: false
      });
    }

    let sheetData = await Sheet.findOneAndDelete({ user });

    if (!sheetData) {
      return res.status(404).json({
        message: "Sheet does not exist",
        success: false
      });
    }

    return res.status(200).json({
      message: "Sheet deleted successfully",
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

// Group creation API call
exports.CreateGroup = async (req, res) => {
  try {
    const SheetData = await Sheet.findOne({ user: req.user.id});

    if (!SheetData) {
      return res.status(400).json({
        message: "Sheet not found",
        success: false,
        groupNames: []
      });
    }

    const groupName = req.body.groupName;

    if (!groupName) {
      return res.status(400).json({
        message: "GroupName is required",
        success: false,
        groupNames: SheetData.groups.map(group => group.groupName)
      });
    }

    // Check if the group already exists
    const groupExists = SheetData.groups.some(group => group.groupName.toLowerCase() === groupName.toLowerCase());

    if (groupExists) {
      return res.status(400).json({
        message: "Group Already Exists",
        success: false,
        groupNames: SheetData.groups.map(group => group.groupName)
      });
    }

    // Create and push the new group
    const newGroup = {
      groupName: groupName,
      problems: []
    };

    SheetData.groups.push(newGroup);

    // Save the updated sheet
    const updatedSheet = await SheetData.save();

    if (updatedSheet) {
      return res.status(200).json({
        message: "Group Created",
        success: true,
        groupNames: updatedSheet.groups.map(group => group.groupName)
      });
    }

    return res.status(400).json({
      message: "Failed to create group",
      success: false,
      groupNames: SheetData.groups.map(group => group.groupName)
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      groupNames: []
    });
  }
};

// Delete group API call
exports.DeleteGroup = async (req, res) => {
  try {
    const SheetData = await Sheet.findOne({ user: req.user.id });

    if (!SheetData) {
      return res.status(400).json({
        message: "Sheet not found",
        success: false,
        groupNames: []
      });
    }

    const groupName = req.body.groupName;

    if (!groupName) {
      return res.status(400).json({
        message: "GroupName is required",
        success: false,
        groupNames: SheetData.groups.map(group => group.groupName)
      });
    }

    const groupExists = SheetData.groups.some(group => group.groupName === groupName);

    if (!groupExists) {
      return res.status(400).json({
        message: "Group Not Exists",
        success: false,
        groupNames: SheetData.groups.map(group => group.groupName)
      });
    }

    // Remove the group
    const updatedSheet = await SheetData.updateOne({
      $pull: {
        groups: { groupName: groupName }
      }
    });

    if (updatedSheet.modifiedCount > 0) {
      const refreshedSheet = await Sheet.findOne({ user: req.body.user });
      return res.status(200).json({
        message: "Group Deleted",
        success: true,
        groupNames: refreshedSheet ? refreshedSheet.groups.map(group => group.groupName) : []
      });
    }

    return res.status(400).json({
      message: "Failed to delete group",
      success: false,
      groupNames: SheetData.groups.map(group => group.groupName)
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      groupNames: []
    });
  }
};


// Show all groups API call
exports.ShowAllGroups = async (req, res) => {
  try {
    let query={};
    query.user=req.user.id;
    // Fetch the sheet data for the user
    const SheetData = await Sheet.findOne(query);
    // Handle case where the sheet is not found
    if (!SheetData) {
      // console.log("Sheet not found");
      return res.status(400).json({
        message: "Sheet not found",
        success: false
      });
    }

    // Map and return group names
    const groupNames = SheetData.groups.map(group => group.groupName);

    return res.status(200).json({
      groups: groupNames,
      success: true
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};


// Add problem to group API call 
exports.AddProblemToGroup = async (req, res) => {
  try {
    const SheetData = await Sheet.findOne({
      user: req.user.id
    });

    if (!SheetData) {
      return res.status(400).json({
        message: "Internal Server Error",
        success: false
      });
    }

    const groupName = req.body.groupName;

    if (!groupName) {
      return res.status(400).json({
        message: "Group Not Specified",
        success: false
      });
    }

    const problem = req.body.problemId;

    if (!problem) {
      return res.status(400).json({
        message: "Problem Not Selected",
        success: false
      });
    }

    const notes = req.body.notes;

    const group = SheetData.groups.filter(group => group.groupName === groupName);

    if (group.length === 0) {
      return res.status(400).json({
        message: "Group Not Exists",
        success: false
      });
    }

    if (!group[0].problems) {
      group[0].problems = [];
    }

    // Check if the problem already exists in the group
    const problemExist = group[0].problems.filter(prob => prob.problem.equals(problem));

    if (problemExist.length > 0) {
      return res.status(400).json({
        message: "Problem Already Exists",
        success: false
      });
    }

    group[0].problems.push({
      problem: problem,
      notes: notes
    });

    const updatedSheet = await SheetData.save();

    if (updatedSheet) {
      return res.status(200).json({
        message: "Problem Added",
        success: true
      });
    }

    return res.status(400).json({
      message: "Failed to add problem",
      success: false
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to add problem",
      success: false
    });
  }
}


// Remove problem from group API call
exports.RemoveProblemFromGroup = async (req, res) => {
  try {
    const user = req.user.id;
    const {groupName, problemId } = req.body;

    // Find the sheet by user
    const sheet = await Sheet.findOne({ user });
    if (!sheet) {
      return res.status(400).json({
        message: "Internal Server Error",
        success: false
      });
    }

    // Find the group by groupName
    const group = sheet.groups.find(group => group.groupName === groupName);
    if (!group) {
      return res.status(400).json({
        message: "Group Not Found",
        success: false
      });
    }

    // Find the problem in the group's problems array
    const problemIndex = group.problems.findIndex(prob => prob.problem.toString() === problemId);
    if (problemIndex === -1) {
      return res.status(400).json({
        message: "Problem Not Found in Group",
        success: false
      });
    }

    // Remove the problem from the group's problems array
    group.problems.splice(problemIndex, 1);

    // Save the updated sheet
    const updatedSheet = await sheet.save();
    if (updatedSheet) {
      return res.status(200).json({
        message: "Problem Removed Successfully",
        success: true
      });
    }
    
    return res.status(400).json({
      message: "Failed to remove problem",
      success: false
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to remove problem",
      success: false
    });
  }
};

// Show problems in group API call
exports.ShowProblemsInGroup = async (req, res) => {
  try {
    let user = req.user.id;
    const groupName = req.query.groupName?.trim();
    console.log("User:", user);
    console.log("Group:", groupName);
    // Validate input
    if (!user || !groupName) {
      return res.status(400).json({
        message: "User ID and group name are required",
        success: false
      });
    }

    // Find the sheet by user (assuming `Sheet` is a plain JavaScript object/array from a database)
    const sheet = await Sheet.findOne({ user });

    if (!sheet) {
      return res.status(404).json({
        message: "No sheet found for the user",
        success: false
      });
    }

    // Find the group by groupName (case-insensitive)
    const group = sheet.groups.find(g => g.groupName.toLowerCase() === groupName.toLowerCase());

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false
      });
    }
    if(!group.problems){
      return res.status(200).json({
        message: "No problems in the group",
        success: true,
        problems: []
      });
    }
    const ProblemList=await Problem.find({_id:{$in:group.problems.map(prob=>prob.problem)}},{title:1,description:1,tags:1,difficulty:1});
    // Return the problems in the group
    return res.status(200).json({
      message: "Problems fetched successfully",
      problems: ProblemList,
      success: true
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Failed to fetch problems",
      success: false
    });
  }
};
