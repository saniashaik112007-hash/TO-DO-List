const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { name, rollNo } = req.body;

    if (!name || !rollNo) {
      return res.status(400).json({ message: "Name and roll number are required." });
    }

    const cleanName = name.trim();
    const cleanRollNo = rollNo.trim();

    let student = await User.findOne({ rollNo: cleanRollNo });

    if (!student) {
      student = await User.create({ name: cleanName, rollNo: cleanRollNo });
    }

    if (student.name.trim().toLowerCase() !== cleanName.toLowerCase()) {
      return res.status(401).json({ message: "This roll number is linked to a different name." });
    }

    res.json({
      _id: student._id,
      name: student.name,
      rollNo: student.rollNo,
    });
  } catch (error) {
    res.status(400).json({ message: "Unable to log in." });
  }
});

module.exports = router;
