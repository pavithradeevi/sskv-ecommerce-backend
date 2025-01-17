import userModel from "../models/userModel.js"


// add products to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId } = req.body; // Removed size
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        // Check if the item exists in the cart
        if (cartData[itemId]) {
            // Increment the quantity for the item
            cartData[itemId].quantity += 1;
        } else {
            // Add new item to the cart with quantity 1
            cartData[itemId] = { quantity: 1 };
        }

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added To Cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId ,itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// get user cart data
const getUserCart = async (req,res) => {

    try {
        
        const { userId } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export { addToCart, updateCart, getUserCart }