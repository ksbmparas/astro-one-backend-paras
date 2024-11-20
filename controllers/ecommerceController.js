const mongoose = require("mongoose");
const configureMulter = require("../configureMulter");
const ProductCategory = require("../models/ecommerceModel/ProductCategory");
const multer = require("multer");
const Product = require("../models/ecommerceModel/Product");
const Pooja = require("../models/ecommerceModel/Pooja");
const Customers = require("../models/customerModel/Customers");
const CustoemrCart = require("../models/ecommerceModel/CustomerCart");
const ProductOrder = require("../models/ecommerceModel/ProductOrder");
const AstromallOrders = require("../models/ecommerceModel/AstromallOrders");
const RechargeWallet = require("../models/customerModel/RechargeWallet");

const uploadProductCategory = configureMulter("uploads/ecommerce/", [
    { name: "image", maxCount: 1 },
]);

const uploadProducts = configureMulter("uploads/ecommerce/", [
    { name: "image", maxCount: 1 },
    { name: "bannerImages", maxCount: 5 },
]);

const uploadPoojaImagesVideos = configureMulter("uploads/astromall/", [
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 1},
]);

exports.createProductCategory = function (req, res) {
    uploadProductCategory(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { categoryName, } = req.body;

            // Validate required fields
            if (!categoryName) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a categoryName.",
                });
            }

            const image = req.files["image"]
                ? req.files["image"][0].path.replace(
                    /^.*ecommerce[\\/]/,
                    "ecommerce/"
                )
                : "";

            if (!image) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a image.",
                });
            }

            // Create a new file entry in the Customers collection
            const productCategory = new ProductCategory({ categoryName, image });
            await productCategory.save();

            res.status(200).json({
                success: true,
                message: "Product category created successfully.",
                data: productCategory,
            });
        } catch (error) {
            console.error("Error uploading product category:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload product category.",
                error: error.message,
            });
        }
    });
};

exports.updateProductCategory = function (req, res) {
    uploadProductCategory(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { categoryId, categoryName, } = req.body;

            if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid categoryId" });
            }

            const image = req.files["image"]
                ? req.files["image"][0].path.replace(
                    /^.*ecommerce[\\/]/,
                    "ecommerce/"
                )
                : "";

            const productCategory = await ProductCategory.findById(categoryId);
            if (categoryName) {
                productCategory.categoryName = categoryName
            }

            if (image) {
                productCategory.image = image
            }
            await productCategory.save();

            res.status(200).json({
                success: true,
                message: "Product category updated successfully.",
                data: productCategory,
            });
        } catch (error) {
            console.error("Error uploading product category:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload product category.",
                error: error.message,
            });
        }
    });
};

exports.getProductCategory = async function (req, res) {
    try {
        // Fetch all skills from the database
        const productCategory = await ProductCategory.find().sort({ _id: -1 });

        // Return the list of skills as a JSON response
        res.status(200).json({ success: true, productCategory });
    } catch (error) {
        console.error("Error fetching productCategory:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch productCategory",
            error: error.message,
        });
    }
};

exports.deleteProductCategory = async function (req, res) {
    try {
        const categoryId = req.body.categoryId;

        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid categoryId" });
        }

        const deletedProductCategory = await ProductCategory.findByIdAndDelete(categoryId);

        if (!deletedProductCategory) {
            return res
                .status(404)
                .json({ success: false, message: "Product category not found." });
        }

        res.status(200).json({
            success: true,
            message: "Product Category deleted successfully",
            deletedProductCategory,
        });
    } catch (error) {
        console.error("Error deleting Product Category:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete Product Category",
            error: error.message,
        });
    }
};

exports.createProducts = function (req, res) {
    uploadProducts(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { categoryId, productName, description, mrp, price, purchasePrice, quantity, expiryDate, manufactureDate, refundRequetDay, inventory } = req.body;

            // Validate required fields
            if (!productName || !categoryId  ) {
                return res.status(400).json({
                    success: false,
                    message: "All field is required",
                });
            }

            if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid categoryId" });
            }

            const image = req.files["image"]
                ? req.files["image"][0].path.replace(
                    /^.*ecommerce[\\/]/,
                    "ecommerce/"
                )
                : "";

            let bannerImages = [];
            const imagesData = req.files["bannerImages"] ?? null;
            if (!!imagesData) {
                bannerImages = imagesData.map((item, index) => {
                    return req.files["bannerImages"][index].path.replace(
                        /^.*ecommerce[\\/]/,
                        "uploads/ecommerce/"
                    );
                })
            }


            if (!image) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a image.",
                });
            }

            if (bannerImages.length == 0) {
                return res.status(200).json({
                    success: false,
                    message: "At least one bannerImage is required",
                });
            }

            // Create a new file entry in the Customers collection
            const product = new Product({ categoryId, productName, description, mrp, price, purchasePrice, quantity, expiryDate, manufactureDate, refundRequetDay, image, bannerImages, inventory });
            await product.save();

            res.status(200).json({
                success: true,
                message: "Produc created successfully.",
                data: product,
            });
        } catch (error) {
            console.error("Error uploading product:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload product.",
                error: error.message,
            });
        }
    });
};

exports.updateProducts = function (req, res) {
    uploadProducts(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { productId, productName, description, mrp, price, purchasePrice, quantity, expiryDate, manufactureDate, refundRequetDay, inventory } = req.body;

            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid productId" });
            }

            const image = req.files["image"]
                ? req.files["image"][0].path.replace(
                    /^.*ecommerce[\\/]/,
                    "ecommerce/"
                )
                : "";

            let bannerImages = [];
            const imagesData = req.files["bannerImages"] ?? null;
            if (!!imagesData) {
                bannerImages = imagesData.map((item, index) => {
                    return req.files["bannerImages"][index].path.replace(
                        /^.*ecommerce[\\/]/,
                        "uploads/ecommerce/"
                    );
                })
            }

            const product = await Product.findById(productId)

            if (!product) {
                return res
                    .status(404)
                    .json({ success: false, message: "product not found" });
            }

            if (image) {
                product.image = image
            }

            if (bannerImages.length != 0) {
                product.bannerImages = bannerImages
            }

            product.productName = productName ?? product.productName
            product.description = description ?? product.description
            product.mrp = mrp ?? product.mrp
            product.price = price ?? product.price
            product.purchasePrice = purchasePrice ?? product.purchasePrice
            product.quantity = quantity ?? product.quantity
            product.expiryDate = expiryDate ?? product.expiryDate
            product.manufactureDate = manufactureDate ?? product.manufactureDate
            product.refundRequetDay = refundRequetDay ?? product.refundRequetDay
            product.inventory = inventory ?? product.inventory

            // Create a new file entry in the Customers collection
            await product.save();

            res.status(200).json({
                success: true,
                message: "Produc updated successfully.",
                data: product,
            });
        } catch (error) {
            console.error("Error uploading product:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload product.",
                error: error.message,
            });
        }
    });
};

exports.getProducts = async function (req, res) {
    try {
        // Fetch all skills from the database
        const { categoryId } = req.body
        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid categoryId" });
        }
        const products = await Product.find({ categoryId }).sort({ _id: -1 });

        // Return the list of skills as a JSON response
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

exports.getAllProducts = async function (req, res) {
    try {
        // Fetch all skills from the database

        const products = await Product.find().populate('categoryId').sort({ _id: -1 });

        // Return the list of skills as a JSON response
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

exports.deleteProduct = async function (req, res) {
    try {
        const productId = req.body.productId;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid productId" });
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found." });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            deletedProduct,
        });
    } catch (error) {
        console.error("Error deleting Product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete Product",
            error: error.message,
        });
    }
};

exports.createPooja = function (req, res) {
    uploadProducts(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { pujaName,description,price} = req.body;
           
            // Validate required fields
            if (!pujaName || !price || !description) {
                return res.status(400).json({
                    success: false,
                    message: "All field is required",
                });
            }

            const image = req.files["image"]
                ? req.files["image"][0].path.replace(
                    /^.*ecommerce[\\/]/,
                    "ecommerce/"
                )
                : "";

            let bannerImages = [];
            const imagesData = req.files["bannerImages"] ?? null;
            if (!!imagesData) {
                bannerImages = imagesData.map((item, index) => {
                    return req.files["bannerImages"][index].path.replace(
                        /^.*ecommerce[\\/]/,
                        "uploads/ecommerce/"
                    );
                })
            }


            if (!image) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a image.",
                });
            }

            // if (bannerImages.length == 0) {
            //     return res.status(200).json({
            //         success: false,
            //         message: "At least one bannerImage is required",
            //     });
            // }

            // Create a new file entry in the Customers collection
            const pooja = new Pooja({ pujaName, description,image,price});
            await pooja.save();

            res.status(200).json({
                success: true,
                message: "Pooja created successfully.",
                data: pooja,
            });
        } catch (error) {
            console.error("Error uploading pooja:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload pooja.",
                error: error.message,
            });
        }
    });
};

exports.updatePooja = function (req, res) {
    uploadProducts(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { pujaId, pujaName,description, price } = req.body;

            if (!pujaId || !mongoose.Types.ObjectId.isValid(pujaId)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid pujaId" });
            }

            const image = req.files["image"]
                ? req.files["image"][0].path.replace(
                    /^.*ecommerce[\\/]/,
                    "ecommerce/"
                )
                : "";

            // let bannerImages = [];
            // const imagesData = req.files["bannerImages"] ?? null;
            // if (!!imagesData) {
            //     bannerImages = imagesData.map((item, index) => {
            //         return req.files["bannerImages"][index].path.replace(
            //             /^.*ecommerce[\\/]/,
            //             "uploads/ecommerce/"
            //         );
            //     })
            // }

            const pooja = await Pooja.findById(pujaId)

            if (!pooja) {
                return res.status(404).json({
                    success: false,
                    message: "Puja not found",
                });
            }


            if (image) {
                pooja.image = image
            }

            // if (bannerImages.length != 0) {
            //     pooja.bannerImages = bannerImages
            // }

            pooja.pujaName = pujaName ?? pooja.pujaName
            pooja.description = description ?? pooja.description
            pooja.price = price ?? pooja.price

            await pooja.save();

            res.status(200).json({
                success: true,
                message: "Pooja updated successfully.",
                data: pooja,
            });
        } catch (error) {
            console.error("Error uploading pooja:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload pooja.",
                error: error.message,
            });
        }
    });
};

exports.getPooja = async function (req, res) {
    try {

        const pooja = await Pooja.find().sort({ _id: -1 });

        // Return the list of skills as a JSON response
        res.status(200).json({ success: true, pooja });
    } catch (error) {
        console.error("Error fetching pooja:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pooja",
            error: error.message,
        });
    }
};


exports.poojaDetailById = async function(req, res){
    try{

        const {id} = req.body;
        if(!id || id == " "){
            return res.status(400).json({
                successs: false,
                message: "please provide id!"
            })
        }

        const getDetail = await AstromallOrders.findById(id);

        if(!getDetail){
            return res.status(200).json({
                success: true,
                message: 'Empty data'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Pooja detail getting successfully',
            data: getDetail
        })
    

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.deletePooja = async function (req, res) {
    try {
        const {pujaId} = req.body;

        if (!pujaId || !mongoose.Types.ObjectId.isValid(pujaId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid pujaId" });
        }

        const deletedPooja = await Pooja.findByIdAndDelete(pujaId);

        if (!deletedPooja) {
            return res
                .status(404)
                .json({ success: false, message: "puja not found." });
        }

        res.status(200).json({
            success: true,
            message: "Pooja deleted successfully",
            deletedPooja,
        });
    } catch (error) {
        console.error("Error deleting Pooja:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete Pooja",
            error: error.message,
        });
    }
};

exports.addToCart = async function (req, res) {
    try {
        const { productId, customerId } = req.body;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid productId" });
        }

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid customerId" });
        }

        const product = await Product.findById(productId)
        const customer = await Customers.findById(customerId)

        if (!product || !customer) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid customerId or productId" });
        }

        if (product?.quantity <= 0) {
            return res
                .status(200)
                .json({ success: false, message: "This product is out of stock" });
        }

        const isAlreadyAdded = await CustoemrCart.findOne({ productId, customerId })

        if (isAlreadyAdded) {
            return res.status(200).json({
                success: true,
                message: "Product is added to your cart",
            });
        }

        const cart = new CustoemrCart({
            productId,
            customerId
        })

        await cart.save()

        return res.status(200).json({
            success: true,
            message: "Product is added to your cart",
            cart,
        });
    } catch (error) {
        console.error("Error deleting Pooja:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete Pooja",
            error: error.message,
        });
    }
};

exports.getCustomerCart = async function (req, res) {
    try {
        const { customerId } = req.body;

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customerId" });
        }

        let cart = await CustoemrCart.find({ customerId }).populate('productId')
        let totalPrice = 0;

        for (let item of cart) {
            // console.log(item, "Itemmmmmmmmmmm")
            const product = item.productId;
            if (product?.quantity <= 0) {
                item.quantity = 0;
                item.status = "OUT_OF_STOCK";
            } else if (item.quantity > product.quantity) {
                item.quantity = product?.quantity;
            }
            await item.save();
            if (item.status !== "OUT_OF_STOCK") {
                totalPrice += item.quantity * product.price;
            }
        }

        cart = await CustoemrCart.find({ customerId }).populate('productId');

        return res.status(200).json({
            success: true,
            message: "Product is added to your cart",
            totalPrice,
            cart,
        });
    } catch (error) {
        console.error("Error deleting Pooja:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete Pooja",
            error: error.message,
        });
    }
};


exports.removeCartItem = async (req, res)=>{
    try{

        const {cartId} = req.body;

        if(!cartId || cartId == " "){
            return res.status(400).json({
                success: false,
                message: 'Please provide cartId!'
            })
        }

        const removeItem = await CustoemrCart.findByIdAndDelete(cartId)

        if(!removeItem){
            return res.status(200).json({
                success: true,
                messsage: 'cartId not found!'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Cart deleted successfully'
        })

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

exports.updateCartItemQuantity = async function (req, res) {
    try {
        const { cartItemId, type } = req.body;

        if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid cartItemId" });
        }

        if (!['ADD', 'REMOVE'].includes(type)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid type. Must be 'ADD' or 'REMOVE'" });
        }

        let cartItem = await CustoemrCart.findById(cartItemId).populate('productId');
        if (!cartItem) {
            return res
                .status(404)
                .json({ success: false, message: "Cart item not found" });
        }

        const product = cartItem.productId;
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        if (type === 'ADD') {
            if (cartItem.quantity >= product.quantity) {
                return res
                    .status(400)
                    .json({ success: false, message: "Reached maximum product quantity" });
            }
            cartItem.quantity += 1;
        } else if (type === 'REMOVE') {
            cartItem.quantity -= 1;
            if (cartItem.quantity <= 0) {
                await CustoemrCart.deleteOne({ _id: cartItemId })
                return res
                    .status(200)
                    .json({ success: true, message: "Product removed from cart" });
            }
        }

        cartItem.status = product.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
        await cartItem.save();

        return res.status(200).json({
            success: true,
            message: `Product quantity updated to ${cartItem.quantity}`,
            cartItem,
        });
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart item quantity",
            error: error.message,
        });
    }
};

exports.orderProduct = async function (req, res) {
    try {
        const { customerId } = req.body;

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customerId" });
        }

        const cartItems = await CustoemrCart.find({ customerId }).populate('productId');
        if (!cartItems.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let totalAmount = 0;

        const orderProducts = cartItems.map(cartItem => {
            const product = cartItem.productId;
            totalAmount += cartItem.quantity * product.price;
            return {
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.price
            };
        });

        const totalWalletRecharge = (await RechargeWallet.find()).length;
        const customerInvoiceId = `#ASTROREMEDY${totalWalletRecharge}`;

        const newOrder = new ProductOrder({
            customerId,
            invoiceId: customerInvoiceId,
            products: orderProducts,
            amount: totalAmount,
            status: 'INITIATED'
        });

        

        const customerWalletHistory = {
            customer: customerId,
            invoiceId: customerInvoiceId,
            gst: 18,
            recieptNumber: totalWalletRecharge + 1,
            discount: "",
            offer: "",
            totalAmount: "",
            amount: totalAmount,
            paymentMethod: "Online",
            transactionType: 'DEBIT',
            type: 'PRODUCT'
        };

        const rechargeTransaction = new RechargeWallet(customerWalletHistory);
      

        await newOrder.save();
        await rechargeTransaction.save()

        await CustoemrCart.deleteMany({ customerId });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });

    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart item quantity",
            error: error.message,
        });
    }
};


exports.bookPuja = async function (req, res) {
    try {
        const {userId, pujaId,  date, time, mode } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId" });
        }

        if (!pujaId || !mongoose.Types.ObjectId.isValid(pujaId)) {
            return res.status(400).json({ success: false, message: "Invalid pujaId" });
        }

        if (!date || !time) {
            return res.status(400).json({ success: false, message: "all field is required" });
        }

        if(!mode || mode == " "){
            return res.status(400).json({
                success: false,
                message: 'mode is required!'
            })
        }

        const dateA = new Date(date)
        const dateB = new Date(time)

        const year = dateA.getFullYear();
        const month = dateA.getMonth();
        const day = dateA.getDate();

        const hours = dateB.getHours();
        const minutes = dateB.getMinutes();
        const seconds = dateB.getSeconds();

        const combinedDateTime = new Date(year, month, day, hours, minutes, seconds);

        const currentDateTime = new Date();
        const timeDifference = (combinedDateTime - currentDateTime) / 1000;
        const differenceInHours = timeDifference / (60 * 60);
        if (differenceInHours < 5) {
            return res.status(200).json({ success: false, message: "Time should be 5 hour greater from current time" });
        }

        const puja = await Pooja.findOne({_id: pujaId})

        const newPoojaOrder = new AstromallOrders({
            customerId:userId,
            poojaId:pujaId,
            price:puja.price,
            mode:mode,
            poojaDate: date,
            poojaTime: time
        })

        await newPoojaOrder.save()

        return res.status(201).json({
            success: true,
            message: "Puja Request send successfully",
            order: newPoojaOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to register pooja",
            error: error.message,
        });
    }
};


exports.allRequestedPuja = async (req, res)=>{
    try{

        const puja = await AstromallOrders.find({}).populate('customerId', 'customerName phoneNumber').populate('poojaId');
        const filterPuja = puja.filter((item)=> item.status != 'ACCEPTED')
        if(!puja){
            return res.status(200).json({
                success: true,
                message: 'empty Data',
                results: puja
            })
        }

        return res.status(200).json({
            success: true,
            message: 'getting data successfully',
            results: filterPuja
        })

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}


exports.pujaAssignToAstrologer = async (req, res)=>{
    try{
        const {id, astrologerId, price} = req.body;

        if(!id || id == " "){
            return res.status(400).json({
                success: false,
                message: 'id is required!'
            })
        }

        if(!astrologerId || astrologerId == " "){
            return res.status(400).json({
                success: false,
                message: 'astrologerId is required!'
            })
        }

        if(!price || price == " "){
            return res.status(400).json({
                success: false,
                message: 'price is required!'
            })
        }

        const assignPuja = await AstromallOrders.findById({_id:id});
        if(!assignPuja){
            return res.status(400).json({
                success: false,
                message: 'please provide valid id'
            })
        }

        assignPuja.astrologerId = astrologerId;
        assignPuja.status = 'ACCEPTED'
        assignPuja.price = price;
        await assignPuja.save();

        return res.status(200).json({
            success: true,
            message:"Assing puja successfully"
        })

        
    
    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

exports.changePujaStatus = async (req, res)=>{
    try{

        const {id, status} = req.body;
        if(!id || id == " "){
            return res.status(400).json({
                success: false,
                message: 'id is required!'
            })
        }

        if(!status || status == " "){
            return res.status(400).json({
                success: false,
                message: 'status is required!'
            })
        }

        const puja = await AstromallOrders.findById({_id: id})

        if(!puja){
            return res.status(400).json({
                success: false,
                message: 'pooja not found'
            })
        }

        if(status == "accepted"){
            puja.status = "ACCEPTED";
            puja.save();
            return res.status(200).json({
                success: true,
                message: 'puja request accepted successfully'
            })
        }


        if(status == "rejected"){
            puja.status = "REJECTED";
            puja.save();
            return res.status(200).json({
                success: true,
                message: 'puja request rejected successfully'
            })
        }


        return res.status(400).json({
            success: false,
            message: 'please provide valid status'
        })

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// exports.getAstrologerRegisteredPooja = async function (req, res) {
//     try {
//         const { astrologerId } = req.body;

//         if (!astrologerId || !mongoose.Types.ObjectId.isValid(astrologerId)) {
//             return res.status(400).json({ success: false, message: "Invalid astrologerId" });
//         }

//         const pooja = await AstromallOrders.find({ astrologerId }).populate('poojaId').populate({
//             path: 'customerId',
//             select: "customerName image gender address phoneNumber email"
//         }).sort({ _id: -1 })

//         return res.status(201).json({
//             success: true,
//             message: "success",
//             pooja
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to get pooja",
//             error: error.message,
//         });
//     }
// };


exports.getAstrologerRegisteredPooja = async function (req, res) {
    try {
        const { astrologerId } = req.body;

        if (!astrologerId || !mongoose.Types.ObjectId.isValid(astrologerId)) {
            return res.status(400).json({ success: false, message: "Invalid astrologerId" });
        }

        const pooja = await AstromallOrders.find({ astrologerId, status: 'ACCEPTED' })
            .populate('poojaId')
            .populate({
                path: 'customerId',
                select: "customerName image gender address phoneNumber email"
            })
            .sort({ _id: -1 });

        // Map the results to change _id to orderId
        const formattedPooja = pooja.map(order => ({
            orderId: order._id, // Rename _id to orderId
            pujaDate: order.poojaDate,
            pujaTime: order.poojaTime,
            poojaId: order.poojaId,
            customer: order.customerId,
            // Add any other fields you want to include from the order
        }));

        return res.status(200).json({
            success: true,
            message: "success",
            pooja: formattedPooja
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};


exports.getCustomerCompletePuja = async (req, res)=>{
    try {
        const { customerId } = req.body;

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customerId" });
        }

        const pooja = await AstromallOrders.find({ customerId, status:'COMPLETED' })
            .populate('poojaId')
            .populate({
                path: 'customerId',
                select: "customerName image gender address phoneNumber email"
            })
            .sort({ _id: -1 });

        // Map the results to change _id to orderId
        const formattedPooja = pooja.map(order => ({
            orderId: order._id, // Rename _id to orderId
            pujaDate: order.poojaDate,
            pujaTime: order.poojaTime,
            status: order.status,
            pujaCompleteDate: order.updatedAt,
            images:order.images,
            videos: order.videos,
            poojaId: order.poojaId,
            customer: order.customerId,
            // Add any other fields you want to include from the order
        }));

        return res.status(200).json({
            success: true,
            message: "success",
            pooja: formattedPooja
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
}


exports.getPujaHistory = async (req, res)=>{
    try{

        const puja = await AstromallOrders.find({status: 'COMPLETED'}).populate('poojaId', 'pujaName description price image bannerImages').populate('astrologerId', 'astrologerName').populate('customerId', 'customerName');

        if(!puja){
            return res.status(404).json({
                success: false,
                message: 'Data not found'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Getting history successfully',
            results: puja
        })

    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: 'Interanal server error'
        })
    }
}


exports.getAstrologerCompletePuja = async (req, res)=>{
    try {
        const { astrologerId } = req.body;

        if (!astrologerId || !mongoose.Types.ObjectId.isValid(astrologerId)) {
            return res.status(400).json({ success: false, message: "Invalid astrologerId" });
        }

        const pooja = await AstromallOrders.find({ astrologerId, status:'COMPLETED' })
            .populate('poojaId')
            .populate({
                path: 'customerId',
                select: "customerName image gender address phoneNumber email"
            })
            .sort({ _id: -1 });

        // Map the results to change _id to orderId
        const formattedPooja = pooja.map(order => ({
            orderId: order._id, // Rename _id to orderId
            pujaDate: order.poojaDate,
            pujaTime: order.poojaTime,
            status: order.status,
            pujaCompleteDate: order.updatedAt,
            images:order.images,
            videos: order.videos,
            poojaId: order.poojaId,
            customer: order.customerId,
            // Add any other fields you want to include from the order
        }));

        return res.status(200).json({
            success: true,
            message: "success",
            pooja: formattedPooja
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }

}


exports.getAstrologerRequestedPooja = async function (req, res) {
    try {
        const orders = await AstromallOrders.find({ status: 'REQUESTED' })
            .populate({
                path: 'astrologerId',
                select: 'astrologerName profileImage' // Assuming the astrologer model has 'name' and 'image' fields
            })
            .populate('poojaId').sort({ _id: -1 }); // Populate the entire pooja object

        return res.status(201).json({
            success: true,
            message: "success",
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};


exports.getCustomerPujaHistory = async (req, res) => {
    try {
        const { customerId } = req.body;

        if (!customerId || customerId.trim() === "") {
            return res.status(400).json({
                success: false,
                message: 'customerId is required!'
            });
        }

        // Retrieve and sort puja history in descending order by pujaDate
        const puja = await AstromallOrders.find({ customerId })
            .populate('poojaId', 'pujaName description image bannerImages createdAt')
            .populate('astrologerId', 'astrologerName phoneNumber gender email profileImage')
            .sort({ pujaDate: -1 }); // Sort by pujaDate in descending order

        if (!puja || puja.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }

        // Get current date
        const currentDate = new Date();

        // Set status based on pujaDate and pujaTime, and prepare updates
        const updatePromises = puja.map(async (order) => {
            const pujaDate = new Date(order.poojaDate);
            const pujaTime = new Date(order.poojaTime);
            const newStatus = (pujaDate < currentDate || pujaTime < currentDate) && order.status !== 'ACCEPTED'
                ? 'EXPIRED'
                : order.status;

            // Update the status in the database if it has changed
            if (newStatus !== order.status) {
                order.status = newStatus; // Update local status
                return order.save(); // Save updated order to the database
            }
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        // Prepare response with updated puja data
        const updatedPuja = await AstromallOrders.find({ customerId })
            .populate('poojaId', 'pujaName description image bannerImages createdAt')
            .populate('astrologerId', 'astrologerName phoneNumber gender email profileImage')
            .sort({ createdAt: -1 }); // Sort again if needed after updates

        return res.status(200).json({
            success: true,
            message: "Getting data successfully",
            results: updatedPuja
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}



exports.getAstrologerRejectedPooja = async function (req, res) {
    try {
        const orders = await AstromallOrders.find({ status: 'REJECTED' })
            .populate({
                path: 'astrologerId',
                select: 'astrologerName profileImage' // Assuming the astrologer model has 'name' and 'image' fields
            })
            .populate('poojaId').sort({ _id: -1 }); // Populate the entire pooja object

        return res.status(201).json({
            success: true,
            message: "success",
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};

exports.getCustomerAcceptedPooja = async function (req, res) {
    try {
        const orders = await AstromallOrders.find({ status: 'ACCEPTED' })
            .populate({
                path: 'astrologerId',
                select: 'astrologerName profileImage' // Assuming the astrologer model has 'name' and 'image' fields
            }).populate({
                path: 'customerId',
                select: 'customerName, image'
            })
            .populate('poojaId').sort({ _id: -1 }); // Populate the entire pooja object

        return res.status(201).json({
            success: true,
            message: "success",
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};

exports.getAstrolgoersPooja = async function (req, res) {
    try {
        const { poojaId } = req.body
        const orders = await AstromallOrders.find({ poojaId, status: 'ACCEPTED' })
            .populate({
                path: 'astrologerId',
                select: 'astrologerName profileImage' // Assuming the astrologer model has 'name' and 'image' fields
            })
            .populate('poojaId').sort({ _id: -1 }); // Populate the entire pooja object

        return res.status(201).json({
            success: true,
            message: "success",
            orders
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};

exports.getCustomerBookedPooja = async function (req, res) {
    try {
        const orders = await AstromallOrders.find({ status: 'ACCEPTED' })
            .populate({
                path: 'astrologerId',
                select: 'astrologerName profileImage' // Assuming the astrologer model has 'name' and 'image' fields
            }).populate({
                path: 'customerId',
                select: 'customerName image'
            })
            .populate('poojaId').sort({ _id: -1 }); // Populate the entire pooja object

        return res.status(200).json({
            success: true,
            message: "success",
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};




exports.updateAstrologerPoojaStatus = async function (req, res) {
    try {
        const { status, orderId } = req.body

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid orderId" });
        }

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(200).json({ success: false, message: 'status should be ACCEPTED Or REJECTED' });
        }

        const pooja = await AstromallOrders.findById(orderId)

        if (!pooja) {
            return res.status(404).json({ success: false, message: "Pooja not found" });
        }

        pooja.status = status
        await pooja.save()

        return res.status(201).json({
            success: true,
            message: "Status updated successfully",
            pooja
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update pooja status pooja",
            error: error.message,
        });
    }
};

exports.orderAstrologerPooja = async function (req, res) {
    try {
        const { customerId, orderId } = req.body

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid orderId" });
        }

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customerId" });
        }

        const pooja = await AstromallOrders.findById(orderId)

        if (!pooja) {
            return res.status(404).json({ success: false, message: "Pooja not found" });
        }

        if (pooja?.status != 'ACCEPTED') {
            return res.status(200).json({ success: false, message: 'This order already booked' });
        }

        pooja.customerId = customerId,
            pooja.status = 'BOOKED'

        await pooja.save()

        return res.status(201).json({
            success: true,
            message: "Order Booked Successfully",
            pooja
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update pooja status pooja",
            error: error.message,
        });
    }
};

exports.completedPooja = async function (req, res) {
    try {
        // Fetch orders with status "COMPLETED"
        const completedOrders = await AstromallOrders.find({ status: 'COMPLETED' });
        // Send the fetched orders as a response
        res.json(completedOrders);
    } catch (error) {
        // Handle any errors that occur during the fetching process
        res.status(500).json({ message: 'Error fetching completed orders', error });
    }
};

exports.orderHistory = async function (req, res) {
    try {
        // Fetch orders with status "COMPLETED"
        //   const orderHistory = await ProductOrder.find()

        const orderHistory = await ProductOrder.find()
            .populate('customerId') // Populates customer details
            .populate('products.productId'); // Populates product details for each product in the order


        // Send the fetched orders as a response
        res.json({ success: true, data: orderHistory });
    } catch (error) {
        // Handle any errors that occur during the fetching process
        res.status(500).json({ message: 'Error fetching product orders', error });
    }
};

exports.updateProductOrderStatus = async function (req, res) {
    try {
        const { status, orderId } = req.body

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid orderId" });
        }

        const productOrder = await ProductOrder.findById(orderId)

        if (!productOrder) {
            return res.status(404).json({ success: false, message: "product order not found" });
        }

        productOrder.status = status
        await productOrder.save()

        return res.status(201).json({
            success: true,
            message: "Status updated successfully",
            productOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update product Order status",
            error: error.message,
        });
    }
};

exports.getProductOrderHistory = async function (req, res) {
    try {
        const { customerId } = req.body;

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customerId" });
        }

        const getProductOrder = await ProductOrder.find({ customerId });

        return res.status(201).json({
            success: true,
            message: "success",
            getProductOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get Product Order",
            error: error.message,
        });
    }
};


exports.completeAstrologerPooja = function (req, res) {
    uploadPoojaImagesVideos(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res
                .status(500)
                .json({ success: false, message: "Multer error", error: err });
        } else if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Error uploading file", error: err });
        }

        try {
            const { orderId, description } = req.body;

            if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ success: false, message: "Invalid orderId" });
            }

            const pooja = await AstromallOrders.findById(orderId)

            if (!pooja) {
                return res.status(404).json({ success: false, message: "Pooja not found" });
            }

            let poojaImages = [];
            const imagesData = req.files["images"] ?? null;
            if (!!imagesData) {
                poojaImages = imagesData.map((item, index) => {
                    return req.files["images"][index].path.replace(
                        /^.*astromall[\\/]/,
                        "uploads/astromall/"
                    );
                })
            }

            let poojaVideos = [];
            const videosData = req.files["videos"] ?? null;
            if (!!videosData) {
                poojaVideos = videosData.map((item, index) => {
                    return req.files["videos"][index].path.replace(
                        /^.*astromall[\\/]/,
                        "uploads/astromall/"
                    );
                })
            }

            pooja.images = poojaImages
            pooja.videos = poojaVideos
            pooja.description = description
            pooja.status = 'COMPLETED'

            await pooja.save()

            res.status(200).json({
                success: true,
                message: "Pooja Completed",
                data: pooja,
            });
        } catch (error) {
            console.error("Error uploading product category:", error);
            res.status(500).json({
                success: false,
                message: "Failed to upload product category.",
                error: error.message,
            });
        }
    });
};

exports.getCustoemerBookedPooja = async function (req, res) {
    try {
        const { customerId } = req.body;

        if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ success: false, message: "Invalid customerId" });
        }

        const pooja = await AstromallOrders.find({ customerId }).populate('poojaId').populate({
            path: 'astrologerId',
            select: "astrologerName profileImage"
        })

        return res.status(201).json({
            success: true,
            message: "success",
            pooja
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get pooja",
            error: error.message,
        });
    }
};






