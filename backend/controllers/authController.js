import userModel from "../models/userModel.js"

export const getProfile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const user = await userModel.findOne({uid});

        if(!user){
            return res.status(404).json({message: "Profile not found"});
        }

        res.json(user);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};

export const createProfile = async (req, res) => {
    
    try {
        const uid = req.user.uid;
        const { displayName, email, photoURL, bio } = req.body;
        
        const existingUser = await userModel.findOne({ uid });
        if (existingUser) {
            return res.status(400).json({ message: "Profile already exists" });
        }
        
        const newUser = userModel.create({
            uid,
            name: displayName || email.split('@')[0],
            email,
            avatar: photoURL || '',
            bio: bio || '',
        });
    console.log("New user created:", newUser);

    res.status(201).json(newUser);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { name, avatar, bio } = req.body;

        const updatedUser = await userModel.findOneAndUpdate(
            { uid },
            { ...(name && {name}), ...(avatar && {avatar}), ...(bio && {bio}) },
            { new: true, runValidators: true }
        )

        if(!updatedUser){
            return res.status(404).json({message: "Profile not found"});
        }
        res.json(updatedUser);
    } catch(error){
        res.status(500).json({message: error.message});
    }
};
