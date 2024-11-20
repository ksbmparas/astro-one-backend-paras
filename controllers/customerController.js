const Customers = require("../models/customerModel/Customers");
const mongoose = require("mongoose");
const multer = require("multer");
const configureMulter = require("../configureMulter");
const Razorpay = require('razorpay');
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/customerModel/File");
const Astrologer = require("../models/adminModel/Astrologer");
const AdminEarning = require("../models/adminModel/AdminEarning");
const CustomerWallet = require("../models/customerModel/CustomerWallet");
const AstrologerWallet = require("../models/astrologerModel/AstrologerWallet");
const Review = require("../models/adminModel/Review");
const LinkedProfile = require("../models/customerModel/LinkedProfile");
const RechargeWallet = require("../models/customerModel/RechargeWallet");
const CustomerNotification = require("../models/adminModel/CustomerNotification");
const FirstRechargeOffer = require("../models/adminModel/FirstRechargeOffer");
const RechargePlan = require("../models/adminModel/RechargePlan");
const notificationService = require("../notificationService");
const ChatHistory = require("../models/adminModel/ChatHistory");
const CallHistory = require("../models/adminModel/CallHistory");
const Banners = require("../models/adminModel/Banners");
const crypto = require("crypto");
const { database } = require("../config/firebase");
const LiveStreaming = require("../models/adminModel/LiveStreaming");
const { postRequest } = require("../utils/apiRequests");
const Gift = require("../models/adminModel/Gift");
const LiveCalls = require("../models/adminModel/LiveCalls");
const axios = require("axios");
const https = require('https');
const convert = require('xml-js');
const AstrologerFollower = require("../models/astrologerModel/AstrologerFollower");
const MatchMaking = require("../models/kundliModel/MatchMaking");
const Numerology = require("../models/adminModel/Numerology");
const NumerologyData = require("../models/kundliModel/Numerology");
const productOrder = require("../models/ecommerceModel/ProductOrder");
const product = require('../models/ecommerceModel/Product')
const fs = require('fs');
const Sms = require("../config/sms");
const VideoCall = require("../models/customerModel/VideoCall");
const moment = require('moment');
const { custom } = require("joi");
const phonepeConfig = require("../config/phonepeConfig");
const PhonepeWallet = require("../models/customerModel/PhonepeWallet");
// const base64 = require('base-64');


// // PhonePe Configuration
// const phonePeConfig = {
//   apiKey: 'ffe16e1d-039e-467a-a6dc-5fa13876c41e',
//   apiUrl: 'https://api.phonepe.com/apis/hermes/v1/order', // Replace with the actual PhonePe API URL if different
// };

const uploadCustomerSignupImage = configureMulter("uploads/customerImage/", [
  { name: "image", maxCount: 1 },
]);

const uploadFile = configureMulter("uploads/chatImage", [
  { name: "filePath", maxCount: 1 },
]);

const uploadCustomerImage = configureMulter("uploads/customerImage/", [
  { name: "image", maxCount: 1 },
]);

const validateCustomerName = (customerName) => {
  // Trim leading and trailing spaces
  customerName = customerName.trim();

  // Regular expression to check for exactly one space between names
  const regex = /^[^\s]+(\s[^\s]+)?$/;

  if (!regex.test(customerName)) {
    throw new Error('Invalid customer name. Only one space is allowed between the first name and last name.');
  }

  return customerName;
};

exports.customerSignup = function (req, res) {
  uploadCustomerSignupImage(req, res, async function (err) {
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
      // Trim spaces from each field
      const {
        customerName = "",
        phoneNumber = "",
        gender = "",
        // wallet = "",
        dateOfBirth = "",
        timeOfBirth = ""
      } = req.body;

      const validatedCustomerName = validateCustomerName(customerName);

      const trimmedFields = {
        customerName: validatedCustomerName,
        phoneNumber: phoneNumber.trim(),
        gender: gender.trim(),
        // wallet: wallet.trim(),
        dateOfBirth: dateOfBirth.trim(),
        timeOfBirth: timeOfBirth.trim()
      };

      // Validate required fields after trimming
      const missingFields = [
        "customerName",
        "phoneNumber",
        "gender",
        "dateOfBirth",
        "timeOfBirth",
        // "wallet"
      ].filter((field) => !trimmedFields[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Please provide ${missingFields.join(", ")}.`,
        });
      }

      const imagePath = req.files["image"]
        ? req.files["image"][0].path.replace(
          /^.*customerImage[\\/]/,
          "customerImage/"
        )
        : "";


      // console.log(imagePath, "imagePathh")

      const existingCustomer = await Customers.findOne({ phoneNumber: trimmedFields.phoneNumber });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          isSignupCompleted: 1,
          message: "Customer already exists.",
        });
      }

      const newCustomer = new Customers({
        customerName: trimmedFields.customerName,
        phoneNumber: trimmedFields.phoneNumber,
        gender: trimmedFields.gender,
        image: imagePath,
        dateOfBirth: trimmedFields.dateOfBirth,
        timeOfBirth: trimmedFields.timeOfBirth,
        wallet_balance: trimmedFields.wallet,
      });

      // console.log(newCustomer, "Check New Cusotmer")

      await newCustomer.save();

      res.status(201).json({
        success: true,
        isSignupCompleted: 1,
        message: "Customer created successfully.",
        data: newCustomer,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create customer.",
        error: error.message,
      });
    }
  });
};


function generateRandomCode() {
  return Math.floor(1000 + Math.random() * 9000);
}

// exports.customerLogin = async function (req, res) {
//   try {
//     const { phoneNumber } = req.body;
//     const otp = await generateRandomCode();
//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         message: `Please provide phoneNumber`,
//       });
//     }
//     let customer = await Customers.findOne({ phoneNumber });
//     if (customer) {
//       const isBanned = customer.banned_status;
//       if (isBanned) {
//         return res.status(200).json({
//           success: false,
//           status: 0,
//           message: "You are banned, Please contact admin.",
//         });
//       }
//       return res.status(200).json({
//         success: true,
//         status: 1,
//         otp: otp,
//         phoneNumber,
//         message: "OTP provided.",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       status: 1,
//       otp: otp,
//       phoneNumber,
//       message: "New customer added. OTP provided.",
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Login failed", error: error.message });
//   }
// };

exports.customerLogin = async function (req, res) {
  try {
    const { phoneNumber } = req.body;
    // Check if phoneNumber is provided
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide phoneNumber",
      });
    }

    // Validate the phoneNumber length and format
    const phoneNumberPattern = /^\d{10}$/; // Regular expression to match exactly 10 digits
    if (!phoneNumberPattern.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    const defaultPhoneOtp = "9319995366"
    const defaultOtp = '1234'

    if(phoneNumber == defaultPhoneOtp){
      const customerr = await Customers.findOne({ phoneNumber });
    // console.log(customer, "Check Customersssss")

    if (customerr) {
      const isBanned = customerr.banned_status;
      const is_deleted = customerr.isDeleted;
      if (isBanned) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "You are banned, Please contact admin.",
        });
      }

      if (is_deleted === 1) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "account is deleted",
          deleted: true
        });
      }

      customerr.otp = defaultOtp
      await customerr.save();
      // sms
      const sms = await Sms.smsOTp(phoneNumber,defaultOtp);
      // console.log(sms, "smss")
      return res.status(200).json({
        success: true,
        status: 1,
        otp: defaultOtp,
        phoneNumber,
        message: "OTP provided.",
      });
    }
  }
   

    const otp = await generateRandomCode();
    let customer = await Customers.findOne({ phoneNumber });
    // console.log(customer, "Check Customersssss")

    if (customer) {
      const isBanned = customer.banned_status;
      const is_deleted = customer.isDeleted;
      if (isBanned) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "You are banned, Please contact admin.",
        });
      }

      if (is_deleted === 1) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "account is deleted",
          deleted: true
        });
      }

      customer.otp = otp
      await customer.save();
      // sms
      const sms = await Sms.smsOTp(phoneNumber,otp);
      // console.log(sms, "smss")
      return res.status(200).json({
        success: true,
        status: 1,
        otp: otp,
        phoneNumber,
        message: "OTP provided.",
      });
    }

    // Add new customer logic here if needed
    // sms

    if(phoneNumber == defaultPhoneOtp){
      const customerr = await Customers.findOne({ phoneNumber });
    // console.log(customer, "Check Customersssss")

    if (customerr) {
      const isBanned = customerr.banned_status;
      const is_deleted = customerr.isDeleted;
      if (isBanned) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "You are banned, Please contact admin.",
        });
      }

      if (is_deleted === 1) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "account is deleted",
          deleted: true
        });
      }

      customerr.otp = defaultOtp
      await customerr.save();
      // sms
      const sms = await Sms.smsOTp(phoneNumber,defaultOtp);
      // console.log(sms, "smss")
      return res.status(200).json({
        success: true,
        status: 1,
        otp: defaultOtp,
        phoneNumber,
        message: "New customer added. OTP provided.",
      });
    }
  }
    const sms = await Sms.smsOTp(phoneNumber,otp)
    // console.log(sms, "smmmmmmmmm")
    res.status(200).json({
      success: true,
      status: 1,
      otp: otp,
      phoneNumber,
      message: "New customer added. OTP provided.",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


exports.verifyCustomer = async function (req, res) {
  try {
    const { phoneNumber, fcmToken, device_id } = req.body;
    const missingFields = [];

    if (!phoneNumber) {
      missingFields.push("phoneNumber");
    }
    if (!fcmToken) {
      missingFields.push("fcmToken");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide ${missingFields.join(", ")}.`,
      });
    }
    let customer = await Customers.findOne({ phoneNumber });
    if (customer) {
      const deviceToken = customer?.fcmToken;
      if (deviceToken) {
        const notification = {
          title: "AstroOne",
          body: "You are logged in new device",
        };
        const data = {
          title: "AstroOne",
          body: "You are logged in new device",
          type: "new_login",
        };

        await notificationService.sendNotification(
          deviceToken,
          notification,
          data
        );
      }

      customer.fcmToken = fcmToken;
      customer.device_id = device_id;

      await customer.save();

      // const tokenResponse = await axios.post(
      //   'https://api.shivampredictionkundali.com/v1/users/generateToken',
      //   {
      //     apikey: '08d7bd28-cd1b-498f-aedd-14acbbda6c43'
      //   },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     httpsAgent: new https.Agent({
      //       rejectUnauthorized: false
      //     })
      //   }
      // );

      // console.log(tokenResponse.data)

      return res.status(200).json({
        success: true,
        message: "Customer verified successfully.",
        customer,
        type: 'home',
        // token: tokenResponse?.data?.data[0]?.token
      });

    } else {
      customer = new Customers({
        fcmToken,
        phoneNumber,
        device_id,
        status: 1,
        image: "customerImage/user_default.jpg",
      });
      await customer.save();
      return res.status(200).json({
        success: true,
        message: "Customer verified successfully.",
        customer: customer,
        type: 'signup'
      });
    }
  } catch (error) {
    console.error("Error during customer verification:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};

// exports.verifyWebCustomer = async function (req, res) {
//   try {
//     const { phoneNumber, webFcmToken, device_id, otp } = req.body;
//     const missingFields = [];

//     if(!otp || otp == " "){
//       return res.status(400).json({
//         success: false,
//         message:"Please provide otp!"
//       })
//     }

//     if (!phoneNumber) {
//       missingFields.push("phoneNumber");
//     }
//     if (!webFcmToken) {
//       missingFields.push("webFcmToken");
//     }

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Please provide ${missingFields.join(", ")}.`,
//       });
//     }
//     let customer = await Customers.findOne({ phoneNumber});
//     if(otp != customer.otp){
//       return res.status(400).json({
//         success: false,
//         message: 'Otp is Incorrect, Please provide correct otp.'
//       })
//     }
//     console.log(customer, "customerrrr dataaa")
//     if (customer) {
//       const deviceToken = customer?.webFcmToken;
//       if (deviceToken) {
//         const notification = {
//           title: "Astroremedy",
//           body: "You are logged in new device",
//         };
//         const data = {
//           title: "Astroremedy",
//           body: "You are logged in new device",
//           type: "new_login",
//         };

//         await notificationService.sendNotification(
//           deviceToken,
//           undefined,
//           data
//         );
//       }

//       customer.webFcmToken = webFcmToken;
//       customer.device_id = device_id;

//       await customer.save();

//       // const tokenResponse = await axios.post(
//       //   'https://api.shivampredictionkundali.com/v1/users/generateToken',
//       //   {
//       //     apikey: '08d7bd28-cd1b-498f-aedd-14acbbda6c43'
//       //   },
//       //   {
//       //     headers: {
//       //       'Content-Type': 'application/json',
//       //     },
//       //     httpsAgent: new https.Agent({
//       //       rejectUnauthorized: false
//       //     })
//       //   }
//       // );

//       // console.log(tokenResponse.data)

//       return res.status(200).json({
//         success: true,
//         message: "Customer verified successfully.",
//         customer,
//         type: 'home',
//         // token: tokenResponse?.data?.data[0]?.token
//       });

//     } else {
//       customer = new Customers({
//         webFcmToken,
//         phoneNumber,
//         device_id,
//         status: 1,
//         image: "customerImage/user_default.jpg",
//       });
//       await customer.save();
//       return res.status(200).json({
//         success: true,
//         message: "Customer verified successfully.",
//         customer: customer,
//         type: 'signup'
//       });
//     }
//   } catch (error) {
//     console.error("Error during customer verification:", error);
//     res.status(500).json({
//       success: false,
//       message: "Verification failed",
//       error: error.message,
//     });
//   }
// };


exports.verifyWebCustomer = async function (req, res) {
  const { phoneNumber, webFcmToken, device_id, otp } = req.body;

  // Check for missing fields
  const missingFields = [];
  if (!otp || otp.trim() === "") missingFields.push("otp");
  if (!phoneNumber) missingFields.push("phoneNumber");
  if (!webFcmToken) missingFields.push("webFcmToken");

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Please provide ${missingFields.join(", ")}.`,
    });
  }

  try {
    let customer = await Customers.findOne({ phoneNumber });
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'customer not found',
      });
    }
    // Validate OTP
    if (!customer || otp != customer.otp) {
      return res.status(400).json({
        success: false,
        message: 'Otp is incorrect or customer not found. Please provide correct otp.',
      });
    }

    console.log(customer, "Customer data");

    // Send notification for new device login
    if (customer.webFcmToken) {
      const notificationData = {
        title: "AstroOne",
        body: "You are logged in on a new device",
        type: "new_login",
      };

      await notificationService.sendNotification(customer.webFcmToken, undefined, notificationData);
    }

    // Update customer information
    customer.webFcmToken = webFcmToken;
    customer.device_id = device_id;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer verified successfully.",
      customer,
      type: 'home',
    });

  } catch (error) {
    console.error("Error during customer verification:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }

  // Create new customer if not found
  const newCustomer = new Customers({
    webFcmToken,
    phoneNumber,
    device_id,
    status: 1,
    image: "customerImage/user_default.jpg",
  });
  
  await newCustomer.save();
  return res.status(200).json({
    success: true,
    message: "Customer created successfully.",
    customer: newCustomer,
    type: 'signup',
  });
};


exports.customerGoogleLogin = async function (req, res) {
  try {
    const { email, fcmToken, device_id, customerName } = req.body;

    if (!email) {
      return res.status(200).json({
        success: false,
        message: "email address is required",
      });
    }

    // Find the customer by phone number, FCM token, and OTP
    let customer = await Customers.findOne({ email });



    if (customer) {
      const isBanned = customer.banned_status;

      if (isBanned) {
        return res.status(200).json({
          success: false,
          status: 0,
          message: "You are banned, Please contact admin.",
        });
      }

      customer.customerName = customerName;
      customer.email = email;
      customer.fcmToken = fcmToken;
      customer.device_id = device_id;

      await customer.save();
      const deviceToken = customer?.fcmToken;

      if (deviceToken) {
        const notification = {
          title: "AstroOne",
          body: "You are logged in new device",
        };
        const data = {
          title: "AstroOne",
          body: "You are logged in new device",
          type: "new_login",
        };

        await notificationService.sendNotification(
          deviceToken,
          undefined,
          data
        );
      }

      return res.status(200).json({
        success: true,
        message: "You logged successfully",
        customer,
      });
    }

    customer = new Customers({
      email,
      fcmToken,
      device_id,
      customerName,
      status: 1,
      image: "customerImage/user_default.jpg",
    });


    await customer.save();

    res.status(200).json({
      success: true,
      status: 1,
      customer,
      message: "You logged successfully",
    });
  } catch (error) {
    console.error("Error during customer verification:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};

// exports.customerGoogleLogin = async function (req, res) {
//   try {
//     const { phoneNumber, fcmToken, device_id, customerName } = req.body;

//     if (!phoneNumber) {
//       return res.status(200).json({
//         success: false,
//         message: "phone Number is required",
//       });
//     }

//     // Find the customer by phone number, FCM token, and OTP
//     let customer = await Customers.findOne({ phoneNumber });



//     if (customer) {
//       const isBanned = customer.banned_status;

//       if (isBanned) {
//         return res.status(200).json({
//           success: false,
//           status: 0,
//           message: "You are banned, Please contact admin.",
//         });
//       }

//       customer.customerName = customerName;
//       customer.phoneNumber = phoneNumber;
//       customer.fcmToken = fcmToken;
//       customer.device_id = device_id;

//       await customer.save();

//       const deviceToken = customer?.fcmToken;

//       if (deviceToken) {
//         const notification = {
//           title: "Astrobooster",
//           body: "You are logged in new device",
//         };
//         const data = {
//           type: "new_login",
//         };

//         await notificationService.sendNotification(
//           deviceToken,
//           notification,
//           data
//         );
//       }

//       return res.status(200).json({
//         success: true,
//         message: "You logged successfully",
//         customer,
//       });
//     }

//     customer = new Customers({
//       phoneNumber,
//       fcmToken,
//       device_id,
//       customerName,
//       status: 1,
//       image: "customerImage/user_default.jpg",
//     });


//     await customer.save();

//     res.status(200).json({
//       success: true,
//       status: 1,
//       customer,
//       message: "You logged successfully",
//     });
//   } catch (error) {
//     console.error("Error during customer verification:", error);
//     res.status(500).json({
//       success: false,
//       message: "Verification failed",
//       error: error.message,
//     });
//   }
// };


exports.getCustomersDetail = async function (req, res) {
  try {
    const { customerId,
      // unique_id 
    } = req.body;

    const existingCustomer = await Customers.findOne({ _id: customerId });

    if (!existingCustomer) {
      return res
        .status(200)
        .json({ success: false, message: "Customer not found." });
    }

    // existingCustomer.unique_id = unique_id;

    await existingCustomer.save();

    const customersDetail = await Customers.findOne({ _id: customerId });

    res.status(200).json({
      success: true,
      message: "Unique ID stored and customer details:",
      customersDetail,
    });
  } catch (error) {
    console.error("Error updating unique ID for customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update unique ID for customer",
      error: error.message,
    });
  }
};

//get all customer list
exports.getAllCustomers = async function (req, res) {
  try {
    // Fetch all Customer from the database
    const customers = await Customers.find();

    // Return the list of Customer as a JSON response
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error("Error fetching Customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Customers",
      error: error.message,
    });
  }
};

// get customer review
exports.getCustomersReview = async function (req, res) {
  try {
    const { astrologerId } = req.query; // Get astrologerId from query parameters

    let query = {}; // Define an empty query object

    // Check if astrologerId is provided
    if (astrologerId) {
      query = { astrologer: astrologerId }; // If provided, filter by astrologerId
    }

    // Fetch all reviews based on the query
    const reviews = await Review.find(query);

    // Return the list of reviews as a JSON response
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching Reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Reviews",
      error: error.message,
    });
  }
};

// file store
exports.storeFile = function (req, res) {
  uploadFile(req, res, async function (err) {
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
      const { fileType } = req.body;

      // Validate required fields
      if (!fileType) {
        return res.status(400).json({
          success: false,
          message: "Please provide a fileType.",
          data: {
            fileType: newFile.fileType,
            filePath: newFile.filePath,
          },
        });
      }

      const filePath = req.files["filePath"]
        ? req.files["filePath"][0].path.replace(/^.*uploads[\\/]/, "uploads/")
        : "";


      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: "File path is empty, file not uploaded correctly."

        });
      }

      // Create a new file entry in the Customers collection
      const newFile = new File({ fileType, filePath });
      await newFile.save();


      res.status(201).json({
        success: true,
        message: "File uploaded successfully.",
        data: newFile,
      });
    } catch (error) {
      console.error("Error uploading File:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload File.",
        error: error.message,
      });
    }
  });
};

// exports.storeFile = function (req, res) {
//   uploadFile(req, res, async function (err) {
//     if (err instanceof multer.MulterError) {
//       return res.status(500).json({ success: false, message: "Multer error", error: err });
//     } else if (err) {
//       return res.status(500).json({ success: false, message: "Error uploading file", error: err });
//     }

//     try {
//       const { fileType } = req.body;

//       // Validate required fields
//       if (!fileType) {
//         return res.status(400).json({
//           success: false,
//           message: "Please provide a fileType."
//         });
//       }

//       const filePath = req.file ? req.file.path.replace(/^.*uploads[\\/]/, "uploads/") : "";

//       // Check if filePath is an empty string
//       if (!filePath) {
//         return res.status(400).json({
//           success: false,
//           message: "File path is empty, file not uploaded correctly."
//         });
//       }

//       // Create a new file entry in the File collection
//       const newFile = new File({ fileType, filePath });
//       await newFile.save();

//       res.status(201).json({
//         success: true,
//         message: "File uploaded successfully.",
//         data: newFile
//       });
//     } catch (error) {
//       console.error("Error uploading File:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to upload File.",
//         error: error.message
//       });
//     }
//   });
// };


// deduct wallet for chat

exports.calculateAndDeductChatPrice = async (req, res) => {
  try {
    const { customerId, astrologerId, startTime, endTime } = req.body;

    // const startDate = new Date(startTime);
    // const endDate = new Date(endTime);

    let startDate, endDate;

    // Check if startTime and endTime include only time (HH:mm:ss)
    if (startTime.includes(":") && endTime.includes(":")) {
      const today = new Date().toISOString().split("T")[0]; // Get current date

      startDate = new Date(`${today}T${startTime}.000Z`); // Concatenate time with today's date
      endDate = new Date(`${today}T${endTime}.000Z`);
    } else {
      // Parse the provided date-time format
      startDate = new Date(startTime);
      endDate = new Date(endTime);
    }

    const durationInMilliseconds = endDate - startDate;
    const durationInSeconds = durationInMilliseconds / 1000;
    // Check if customerId exists in Customers table
    const customer = await Customers.findById(customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Check if astrologerId exists in Astrologer table
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res
        .status(404)
        .json({ success: false, message: "Astrologer not found" });
    }

    // Check if astrologer has chat_price defined
    if (astrologer.chat_price === undefined || astrologer.chat_price === null) {
      return res.status(400).json({
        success: false,
        message: "Chat price not defined for the astrologer",
      });
    }

    const chatPricePerSecond = astrologer.chat_price / 60; // Assuming price is per minute
    const totalChatPrice = parseFloat(
      (durationInSeconds * chatPricePerSecond).toFixed(2)
    );

    if (customer.wallet_balance < totalChatPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Deduct balance from the Customer schema
    customer.wallet_balance -= totalChatPrice;

    // Update Customer's wallet balance
    await customer.save();

    //  chat history data stored
    const chatHistory = new ChatHistory({
      customerId,
      astrologerId,
      startTime,
      endTime,
      durationInSeconds,
      totalChatPrice,
    });

    // Save chat history entry
    await chatHistory.save();

    // Update Astrologer's wallet balance
    astrologer.wallet_balance += totalChatPrice;
    await astrologer.save();

    res.status(200).json({
      success: true,
      message: "Chat price deducted and added to astrologer successfully",
      remainingBalance: customer.wallet_balance.toFixed(2),
    });
  } catch (error) {
    console.error("Error deducting chat price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deduct chat price",
      error: error.message,
    });
  }
};

exports.updateChatHistoryAndBalances = async (req, res) => {
  try {
    const { chatHistoryId, startTime, endTime } = req.body;

    const existingChatHistory = await ChatHistory.findById(chatHistoryId);
    if (!existingChatHistory) {
      return res
        .status(404)
        .json({ success: false, message: "Chat history not found" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const durationInMilliseconds = endDate - startDate;
    const durationInSeconds = durationInMilliseconds / 1000;

    const astrologer = await Astrologer.findById(
      existingChatHistory.astrologerId
    );
    if (!astrologer) {
      return res
        .status(404)
        .json({ success: false, message: "Astrologer not found" });
    }

    if (astrologer.chat_price === undefined || astrologer.chat_price === null) {
      return res.status(400).json({
        success: false,
        message: "Chat price not defined for the astrologer",
      });
    }

    const chatPricePerSecond = astrologer.chat_price / 60; // Assuming price is per minute
    const totalChatPrice = parseFloat(
      (durationInSeconds * chatPricePerSecond).toFixed(2)
    );

    const customer = await Customers.findById(existingChatHistory.customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    if (customer.wallet_balance < totalChatPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    customer.wallet_balance -= totalChatPrice;
    await customer.save();

    astrologer.wallet_balance += totalChatPrice;
    await astrologer.save();

    existingChatHistory.startTime = startTime;
    existingChatHistory.endTime = endTime;
    existingChatHistory.durationInSeconds = durationInSeconds;
    existingChatHistory.totalChatPrice = totalChatPrice;
    await existingChatHistory.save();

    res.status(200).json({
      success: true,
      message: "Chat history and balances updated successfully",
      remainingBalance: customer.wallet_balance.toFixed(2),
    });
  } catch (error) {
    console.error("Error updating chat history and balances:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update chat history and balances",
      error: error.message,
    });
  }
};

exports.linkedProfile = async function (req, res) {
  try {
    const {
      customerId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      maritalStatus,
      topic_of_concern,
      longitude,
      latitude,
      description
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "customerId",
      "firstName",
      "lastName",
      "gender",
      "dateOfBirth",
      "timeOfBirth",
      "placeOfBirth",
      "latitude",
      "longitude",
      "maritalStatus",
      "topic_of_concern",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide ${missingFields.join(", ")}.`,
      });
    }

    // Check if the customerId exists in the Customers collection
    const existingCustomer = await Customers.findById(customerId);

    if (!existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer does not exist. Profile cannot be added.",
      });
    }

    // Create a new profile in the LinkedProfile collection
    const newProfileData = {
      customerId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      maritalStatus,
      topic_of_concern,
      latitude,
      longitude,
      description
    };

    // Create a new instance of LinkedProfile model
    const newProfile = new LinkedProfile(newProfileData);

    // Save the new profile to the database
    await newProfile.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully.",
      data: newProfile?._id,
    });
  } catch (error) {
    console.error("Error creating Profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Profile.",
      error: error.message,
    });
  }
};

// exports.updateCustomerDetails = async function (req, res) {
//   uploadCustomerImage(req, res, async function (err) {
//     if (err instanceof multer.MulterError) {
//       return res
//         .status(500)
//         .json({ success: false, message: "Multer error", error: err });
//     } else if (err) {
//       return res
//         .status(500)
//         .json({ success: false, message: "Error uploading file", error: err });
//     }

//     try {
//       const { customerId } = req.body; // Destructure customerId from req.body

//       const existingCustomer = await Customers.findById(customerId);

//       if (!existingCustomer) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Customer not found." });
//       }

//       const {
//         customerName,
//         phoneNumber,
//         gender,
//         dateOfBirth,
//         placeOfBirth,
//         timeOfBirth,
//         email,
//         alternateNumber,
//         city,
//         state,
//         country,
//         zipCode,
//         latitude,
//         longitude,
//         is_registered
//       } = req.body;

//       if (phoneNumber) {
//         const isExits = await Customers.findOne({ phoneNumber })
//         if (isExits) {
//           res.status(200).json({
//             success: false,
//             message: "This phone number already taken.",
//           });
//         }
//         existingCustomer.phoneNumber = phoneNumber
//       }

//       if (email) {
//         const isExits = await Customers.findOne({ email })
//         if (isExits) {
//           res.status(200).json({
//             success: false,
//             message: "This email already taken.",
//           });
//         }
//         existingCustomer.email = email
//       }

//       const address = {
//         city: city,
//         state: state,
//         country: country,
//         birthPlace: placeOfBirth,
//         zipCode: zipCode,
//         latitude,
//         longitude
//       }

//       existingCustomer.customerName =
//         customerName || existingCustomer.customerName;
//       existingCustomer.gender = gender || existingCustomer.gender;
//       existingCustomer.dateOfBirth =
//         dateOfBirth || existingCustomer.dateOfBirth;
//       existingCustomer.address = address || existingCustomer.address;
//       existingCustomer.timeOfBirth =
//         timeOfBirth || existingCustomer.timeOfBirth;
//       existingCustomer.email = email || existingCustomer.email;
//       existingCustomer.alternateNumber =
//         alternateNumber || existingCustomer.alternateNumber;
//       existingCustomer.is_registered =
//       is_registered || existingCustomer.is_registered;

//               if (req.files["image"]) {
//         const imagePath = req.files["image"][0].path.replace(
//           /^.*customerImage[\\/]/,
//           "customerImage/"
//         );
//         existingCustomer.image = imagePath; // Corrected variable name to existingCustomer.image
//       }

//       await existingCustomer.save();

//       res.status(200).json({
//         success: true,
//         message: "Customer updated successfully.",
//         data: existingCustomer,
//       });
//     } catch (error) {
//       console.error("Error updating Customer:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to update Customer.",
//         error: error.message,
//       });
//     }
//   });
// };


exports.updateCustomerDetails = async function (req, res) {
  uploadCustomerImage(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: "Multer error", error: err });
    } else if (err) {
      return res.status(500).json({ success: false, message: "Error uploading file", error: err });
    }

    try {
      const { customerId } = req.body; // Destructure customerId from req.body

      const existingCustomer = await Customers.findById(customerId);

      if (!existingCustomer) {
        return res.status(404).json({ success: false, message: "Customer not found." });
      }

      const {
        customerName,
        phoneNumber,
        gender,
        dateOfBirth,
        placeOfBirth,
        timeOfBirth,
        email,
        alternateNumber,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        is_registered
      } = req.body;


      // Check phone number
      if (phoneNumber) {
        const phoneExists = await Customers.findOne({ phoneNumber });
        if (phoneExists && phoneExists._id.toString() !== customerId) {
          return res.status(400).json({
            success: false,
            message: "This phone number is already taken.",
          });
        }
        existingCustomer.phoneNumber = phoneNumber;
      }

      // Check email
      if (email) {
        const emailExists = await Customers.findOne({ email });

        if (emailExists && emailExists._id.toString() !== customerId) {
          return res.status(400).json({
            success: false,
            message: "This email is already taken. Please provide a new email ID that does not exist.",
          });
        }
        existingCustomer.email = email;
      }

      const address = {
        city: city,
        state: state,
        country: country,
        birthPlace: placeOfBirth,
        zipCode: zipCode,
        latitude,
        longitude
      };

      existingCustomer.customerName = customerName || existingCustomer.customerName;
      existingCustomer.gender = gender || existingCustomer.gender;
      existingCustomer.dateOfBirth = dateOfBirth || existingCustomer.dateOfBirth;
      existingCustomer.address = address || existingCustomer.address;
      existingCustomer.timeOfBirth = timeOfBirth || existingCustomer.timeOfBirth;
      existingCustomer.alternateNumber = alternateNumber || existingCustomer.alternateNumber;
      existingCustomer.is_registered = is_registered || existingCustomer.is_registered;

      if (req.files["image"]) {
        const imagePath = req.files["image"][0].path.replace(/^.*customerImage[\\/]/, "customerImage/");
        existingCustomer.image = imagePath;
      }

      await existingCustomer.save();

      res.status(200).json({
        success: true,
        message: "Customer updated successfully.",
        data: existingCustomer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update Customer.",
        error: error.message,
      });
    }
  });
};



exports.rechargeCustomerWallet = async function (req, res) {
  try {
    const { customerId, amount, firstRechargeId, rechargePlanId } = req.body;

    // Fetch customer by ID
    const customer = await Customers.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const totalWalletRecharge = (await RechargeWallet.find()).length;
    const invoiceId = `#ASTROONE${totalWalletRecharge}`;
    let rechargeAmount = parseFloat(amount);
    const history = {
      customer: customerId,
      invoiceId: invoiceId,
      gst: 18,
      recieptNumber: totalWalletRecharge + 1,
      discount: "",
      offer: "",
      totalAmount: rechargeAmount,
      amount: rechargeAmount,
      paymentMethod: "Online",
      transactionType: 'CREDIT',
      type: 'WALLET_RECHARGE'
    };
    if (!!firstRechargeId) {
      const firstRecharge = await FirstRechargeOffer.findById(firstRechargeId);
      const recharge = firstRecharge.first_recharge_plan_amount;
      const discount = firstRecharge.first_recharge_plan_extra_percent;
      rechargeAmount = recharge + (recharge * discount) / 100;
      history.totalAmount = rechargeAmount;
      history.amount = rechargeAmount;
      history.offer = discount.toString();
      customer.first_wallet_recharged = true;
    } else if (!!rechargePlanId) {
      const plan = await RechargePlan.findById(rechargePlanId);
      const recharge = plan.amount;
      const discount = plan.percentage;
      rechargeAmount = recharge + (recharge * discount) / 100;
      history.totalAmount = rechargeAmount;
      history.amount = rechargeAmount;
      history.offer = discount.toString();
    } else {
      history.totalAmount = rechargeAmount;
    }

    const rechargeTransaction = new RechargeWallet(history);

    await rechargeTransaction.save();
    // Update wallet balance in the Customers schema

    customer.wallet_balance = customer.wallet_balance + rechargeAmount;
    await customer.save();

    const updatedCustomer = await Customers.findById(customerId)

    res.status(200).json({
      success: true,
      message: "Wallet recharge successful.",
      updatedCustomer
    });
  } catch (error) {
    console.error("Error recharging wallet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recharge wallet.",
      error: error.message,
    });
  }
};

exports.customersWalletBalance = async function (req, res) {
  try {
    const { customerId } = req.body;

    let query = {};

    if (customerId) {
      query = { customer: customerId };
    }

    // Fetch only the 'wallet_balance' field based on the query
    const walletBalance = await CustomerWallet.find(query).select(
      "wallet_balance"
    );

    res.status(200).json({ success: true, walletBalance });
  } catch (error) {
    console.error("Error fetching Wallet Balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Wallet Balance",
      error: error.message,
    });
  }
};

exports.customersWalletHistory = async function (req, res) {
  try {
    const { customerId } = req.body;

    // Fetch only the 'wallet_balance' field based on the query
    const walletHistory = await RechargeWallet.find({ customer: customerId }).sort({ _id: -1 });

    res.status(200).json({ success: true, walletHistory });
  } catch (error) {
    console.error("Error fetching Wallet Balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Wallet Balance",
      error: error.message,
    });
  }
};

exports.getCustomerAllFirstRechargeOffer = async function (req, res) {
  try {
    const allFirstRechargeOffer = await FirstRechargeOffer.find({
      first_recharge_status: "Active",
    }).sort({ _id: -1 });

    if (!allFirstRechargeOffer) {
      return res
        .status(404)
        .json({ success: false, message: "No FirstRechargeOffer found." });
    }

    res
      .status(200)
      .json({ success: true, allFirstRechargeOffer: allFirstRechargeOffer });
  } catch (error) {
    console.error("Error fetching all First Recharge Offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all First Recharge Offer",
      error: error.message,
    });
  }
};

exports.getCustomerAllRechargePlan = async function (req, res) {
  try {
    const allRechargePlan = await RechargePlan.find({
      recharge_status: "Active",
    });

    if (!allRechargePlan) {
      return res
        .status(404)
        .json({ success: false, message: "No subskill found." });
    }

    res.status(200).json({ success: true, allRechargePlan: allRechargePlan });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

exports.createRazorpayOrder = async function (req, res) {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(200).send({ status: false, message: "amount field is required", })
    }

    console.log("fdsklajfdklsjfdkldsj")

    var instance = new Razorpay({
      // key_id: 'rzp_test_VbBToLHDFwSePC',
      key_id: 'rzp_live_rkdilJf4Va5VNc',
      // key_secret: 'LNTI6xXUqfnj6U7jfd4CO9Xw',
      key_secret: 'Yti1iRH9JwKIhaNl6Itmt7Zl'
    });

    const response = await instance.orders.create({
      "amount": amount * 100,
      "currency": "INR",
    })

    console.log(response, "check responseee")

    if (response?.status == 'created') {
      return res.status(200).json({ status: true, data: response })
    }

    return res.status(200).json({ status: falseeeee, message: "Order not created", })
  } catch (error) {
    console.log(error, "errrorrrrrrrrrr")
    // If an error occurs, send an error response
    return res.status(500).json({ status: false, message: error });
  }
},


exports.checkPaymentStatus = async (req, res)=>{
  try {
    const merchantTransactionId = req.params.txnId;
    const merchantUserId = "ASTROREMEDYPGONLINE";  // Update with your merchant ID
    const key = "ffe16e1d-039e-467a-a6dc-5fa13876c41e";  // Update with your API key

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantUserId}/${merchantTransactionId}` + key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const URL = `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantUserId}/${merchantTransactionId}`;

    const options = {
        method: 'GET',
        url: URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': merchantUserId,
        }
    };

    console.log("Status API Request Options:", options);

    try {
        const response = await axios(options);

        console.log(response.data, "reeeeeeeee")

        if (response.data.data.responseCode === 'SUCCESS') {
           
            res.status(200).json({ msg: response.data.message, success: response.data.success, results: response.data.data });

        } else {
            
            res.status(200).json({ msg: response.data.message, success: response.data.success, results: response.data.data });
        }
    } catch (error) {
        console.error("Status API Error:", error.message);
        console.error("Status API Error Response:", error.response.data);
        res.status(500).json({ msg: "Error checking payment status", status: "error", error: error.message });
    }
} catch (error) {
    console.error("Internal Server Error:", error.message);
    res.status(500).json({ msg: "Internal Server Error", status: "error", error: error.message });
}
}



exports.createPhonePayOrder = async (req, res) => {
  const merchantId = 'ASTROREMEDYPGONLINE';
  const secretKey = 'ffe16e1d-039e-467a-a6dc-5fa13876c41e';

  try {
    const { amount, phoneNumber, name } = req.body;

    if(!name || name == " "){
      return res.status(400).json({
        success: false,
        message: 'name is required!'
      })
    }

    if(!amount || amount == " "){
      return res.status(400).json({
        success: false,
        message: 'amount is required!'
      })
    }

    if(!phoneNumber || phoneNumber == " "){
      return res.status(400).json({
        success: false,
        message: 'phoneNumber is required'
      })
    }
    const transactionId = `ORDER_${Date.now()}`

    // Prepare the payload
    const data = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      amount: amount * 100,
      name: name,
      redirectUrl: `https://astrooneapi.ksdelhi.net/api/customers/status/${transactionId}`,
      redirectMode: 'GET',
      mobileNumber: phoneNumber,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    console.log(data, 'dataa')

    const keyIndex = 1;
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const stringToHash = `${payloadMain}/pg/v1/pay${secretKey}`;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checkSum = `${sha256}###${keyIndex}`;

    const prodUrl = 'https://api.phonepe.com/apis/hermes/pg/v1/pay';

    const options = {
      method: 'POST',
      url: prodUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checkSum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios(options);
    return res.json(response.data);
    
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message || error, // Return a more user-friendly error message
    });
  }
};

  // get all linked profile
  exports.getallLinkedProfile = async function (req, res) {
    const { customerId } = req.body;

    try {
      if (!customerId) {
        return res
          .status(400)
          .json({ success: false, message: "CustomerId is required." });
      }

      const linkedProfileData = await LinkedProfile.find({ customerId });

      if (!linkedProfileData || linkedProfileData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Linked profile data not found for the given customerId.",
        });
      }

      res.status(200).json({ success: true, data: linkedProfileData });
    } catch (error) {
      console.error("Error fetching linked profile data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch linked profile data.",
        error: error.message,
      });
    }
  };

exports.getLinkedProfile = async function (req, res) {
  const { profileId } = req.body;

  try {
    if (!profileId) {
      return res
        .status(400)
        .json({ success: false, message: "profileId is required." });
    }

    const data = await LinkedProfile.findById(profileId);
    if (!data) {

      res.status(200).json({ success: false, data: data });
    }

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Error fetching linked profile data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch linked profile data.",
      error: error.message,
    });
  }
};








exports.deleteLinkedProfile = async function (req, res) {
  const { linkedId } = req.body;

  try {
    if (!linkedId || linkedId == " ") {
      return res
        .status(400)
        .json({ success: false, message: "Please provide linkedId!" });
    }

    const data = await LinkedProfile.findByIdAndDelete(linkedId);
    if (!data) {
      res.status(200).json({ success: false, message: 'linkedId does not exits' });
    }

    res.status(200).json({
       success: true,
       message:"Data deleted successfully"
       });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Send notification to Customer
exports.sendNotificationToCustomer = async (req, res) => {
  try {
    const { astrologerId, customerId } = req.body;
    const customer = await Customers.findById(customerId);
    const customerFCMToken = customer?.fcmToken;
    const astrologer = await Astrologer.findById(astrologerId);

    const astrologerData = {
      notificationBody: "Astrologer is responding for your chat request.",
      astrologerName: astrologer?.astrologerName,
      profileImage: astrologer?.profileImage,
      astrologer_id: astrologerId,
      chat_price: astrologer?.chat_price,
      type: "Chat Request",
      priority: "High",
    };

    const deviceToken = customerFCMToken;

    const title = `Response of Chat request from ${astrologerData.astrologerName || "an Astrologer."
      }`;
    const notification = {
      title,
      body: astrologerData,
    };

    astrologer.chat_status = "busy";
    await astrologer.save();

    await notificationService.sendNotification(deviceToken, notification);

    res.status(200).json({
      success: true,
      message:
        "Notification sent successfully to the customer. Astrologer status updated to busy.",
    });
  } catch (error) {
    console.error("Failed to send notification to the customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification to the customer.",
      error: error.message,
    });
  }
};

// initiate call with zego
exports.initiateCall = async (req, res) => {
  try {
    const { formId, customerId, astrologerId, callPrice } = req.body;

    // Fetch customer data
    const customer = await Customers.findById(customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Fetch astrologer data
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res
        .status(404)
        .json({ success: false, message: "Astrologer not found" });
    }

    // Fetch data from LinkedProfile based on provided formId and customerId association
    const linkedProfile = await LinkedProfile.findOne({
      _id: formId,
      customerId: customerId,
    });

    if (!linkedProfile) {
      return res.status(404).json({
        success: false,
        message: "LinkedProfile not found for this Customer ID and ID",
      });
    }

    const totalCall = await CallHistory.find();
    const inoiceId = "NAMO" + totalCall.length.toString();

    // Create a new entry in CallHistory table
    const newCall = new CallHistory({
      formId: formId,
      customerId: customerId,
      astrologerId: astrologerId,
      callPrice: callPrice,
      transactionId: inoiceId,
      commissionPrice: astrologer?.commission_call_price,
    });

    // Save the new call entry to the database

    await newCall.save();

    if (astrologer?.call_notification) {
      const astrologerFCMToken = astrologer?.fcmToken;

      const deviceToken = astrologerFCMToken;

      const title = `Call request from ${customer?.customerName || "a customer"
        }`;
      const notification = {
        title,
        body: "Customer is Requesting for call",
      };
      const data = {
        title,
        body: "Customer is Requesting for call",
        customerName: customer?.customerName,
        customerImage: customer?.image,
        user_id: customerId,
        wallet_balance: customer?.wallet_balance,
        type: "call_request",
        priority: "high",
        invoiceId: inoiceId,
        astroID: astrologerId,
      };

      await notificationService.sendNotification(
        deviceToken,
        notification,
        data
      );
    }

    res.status(200).json({
      success: true,
      message: "Data retrieved and saved successfully",
      newCall,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.createCall = async (req, res) => {
  try {
    const {
      appid,
      call_id,
      caller,
      create_time,
      event,
      nonce,
      payload,
      signature,
      timestamp,
      user_ids,
    } = req.body;
    const secret = "50b5c028f7a594e4b6eab83bd81067ad"; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature) {
      const parsedPayload = JSON.parse(payload);
      const callData = JSON.parse(parsedPayload?.data);
      if (event === "call_create") {
        console.log("callId", call_id);
        const existingCall = await CallHistory.findOne({
          transactionId: callData?.custom_data?.transId,
        });
        existingCall.callId = call_id;
        // Save the new call entry to the database
        await existingCall.save();
      }
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.timeoutCall = async (req, res) => {
  try {
    const {
      appid,
      call_id,
      caller,
      create_time,
      event,
      nonce,
      payload,
      signature,
      timestamp,
      user_ids,
    } = req.body;

    const secret = process.env.CALL_SECRET; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "timeout_cancel") {
      const callData = await CallHistory.findOne({ callId: call_id });
      callData.status = "Not Connected";
      database.ref(`OnGoingCall/${callData?.astrologerId}`).remove();
      await callData.save();
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.cancelCall = async (req, res) => {
  try {
    const {
      appid,
      call_id,
      caller,
      create_time,
      event,
      nonce,
      payload,
      signature,
      timestamp,
      user_ids,
    } = req.body;

    const secret = "50b5c028f7a594e4b6eab83bd81067ad"; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "call_cancel") {
      const callData = await CallHistory.findOne({ callId: call_id });
      callData.status = "Not Connected";
      database.ref(`OnGoingCall/${callData?.astrologerId}`).remove();
      await callData.save();
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    const {
      appid,
      call_id,
      caller,
      create_time,
      event,
      nonce,
      payload,
      signature,
      timestamp,
      user_ids,
    } = req.body;

    const secret = "50b5c028f7a594e4b6eab83bd81067ad"; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature) {
      console.log("call id", call_id);
      const callData = await CallHistory.findOne({ callId: call_id });
      console.log(callData);
      callData.status = "Ongoing";
      callData.startTime = new Date().getTime().toString();
      await callData.save();
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.rejectCall = async (req, res) => {
  try {
    const {
      appid,
      call_id,
      caller,
      create_time,
      event,
      nonce,
      payload,
      signature,
      timestamp,
      user_ids,
    } = req.body;

    const secret = "50b5c028f7a594e4b6eab83bd81067ad"; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "call_reject") {
      const callData = await CallHistory.findOne({ callId: call_id });
      callData.status = "Declined";
      database.ref(`OnGoingCall/${callData?.astrologerId}`).remove();
      await callData.save();
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.disconectCall = async (req, res) => {
  try {
    // console.log('discon', req.body)
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

function getNextPerfectMinute(seconds) {
  const secondsInMinute = 60;
  const secondsToNextMinute = secondsInMinute - (seconds % secondsInMinute);
  const nextPerfectMinute = seconds + secondsToNextMinute;
  return nextPerfectMinute;
}

exports.endCall = async (req, res) => {
  try {
    const {
      appid,
      room_id,
      event,
      nonce,
      room_session_id,
      close_reason,
      room_close_time,
      signature,
      timestamp,
    } = req.body;

    const secret = "50b5c028f7a594e4b6eab83bd81067ad"; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "room_close") {
      const callId = room_id.replace(/^\d+(?=namo)/i, "");
      const callData = await CallHistory.findOne({ transactionId: callId });
      const customer = await Customers.findOne({ _id: callData?.customerId });
      const astrologer = await Astrologer.findOne({
        _id: callData?.astrologerId,
      });
      const startTime = parseInt(callData.startTime);
      const endTime = new Date().getTime();
      let totalSeconds = (endTime - startTime) / 1000;

      totalSeconds = getNextPerfectMinute(totalSeconds);

      if (customer?.new_user) {
        if (totalSeconds > 300) {
          totalSeconds = 300 - totalSeconds;
        } else {
          totalSeconds = 0;
        }
      }

      const totalTime = totalSeconds / 60;
      const callPrice = parseFloat(callData?.callPrice);
      const totalPrice = totalTime * callPrice;
      if (totalTime == NaN) {
        return res.status(200).json({
          success: false,
        });
      }

      let commissionPrice = 0

      if (callData?.commissionPrice) {
        commissionPrice = (totalPrice / callData?.commissionPrice).toFixed(2);
      }

      const astrologerPrice = totalPrice - commissionPrice

      astrologer.total_minutes += totalTime;
      astrologer.wallet_balance += astrologerPrice;
      customer.wallet_balance -= totalPrice;
      customer.new_user = false;
      callData.totalCallPrice = totalPrice;
      callData.durationInSeconds = totalSeconds;
      callData.endTime = new Date().getTime().toString();
      callData.status = "Complete";

      const adminEarnings = new AdminEarning({
        type: "call",
        astrologerId: callData?.astrologerId,
        customerId: callData?.customerId,
        transactionId: callId,
        totalPrice: totalPrice,
        adminPrice: commissionPrice,
        partnerPrice: astrologerPrice,
        historyId: callData?._id,
        duration: totalSeconds.toFixed(0),
        chargePerMinutePrice: callPrice + callData?.commissionPrice,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });

      database.ref(`OnGoingCall/${callData?.astrologerId}`).remove();

      await adminEarnings.save();
      await astrologer.save();
      await customer.save();
      await callData.save();
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.getCallData = async (req, res) => {
  try {
    const { trans_id } = req.body;

    const callData = await CallHistory.findOne({ transactionId: trans_id });
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.

    if (callData) {
      res.status(200).json({
        success: true,
        callData,
      });
    } else {
      res.status(200).json({
        success: false,
        callData: null,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};
// initiate call with exotel

exports.initiateCallWithExotel = async (req, res) => {
  try {
    const { formId, customerId, astrologerId } = req.body;

    // Fetch customer data
    const customer = await Customers.findById(customerId);
    if (!customer) {
      return res
        .status(200)
        .json({ success: false, message: "Customer not found" });
    }

    // Fetch astrologer data
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res
        .status(200)
        .json({ success: false, message: "Astrologer not found" });
    }

    if (astrologer.call_status != 'online') {
      return res
        .status(200)
        .json({ success: false, message: `Astrologer is ${astrologer.call_status}` });
    }

    const linkedProfile = await LinkedProfile.findOne({
      _id: formId,
    });

    if (!linkedProfile) {
      return res.status(200).json({
        success: false,
        message: "LinkedProfile not found for this Customer ID and ID",
      });
    }

    const callPrice = parseFloat(astrologer?.call_price) + parseFloat(astrologer?.commission_call_price)

    if (customer?.wallet_balance < callPrice) {
      return res
        .status(200)
        .json({ success: false, message: 'Insuffiecient balance' });
    }

    if (!customer?.phoneNumber) {
      return res
        .status(200)
        .json({ success: false, message: 'Please update your profile' });
    }

    let maxDuration = parseInt((customer?.wallet_balance / callPrice) * 60)

    if (maxDuration > 60) {
      maxDuration = 60 * 60
    }


    // const totalCall = await CallHistory.find();
    // const inoiceId = "ASTROKUNJ" + totalCall.length.toString();

    // Create a new entry in CallHistory table

    // const username = '48fea502ec0ca3d385d325d71914b06c528deb9c505e1c32';
    // const password = 'a7641e33a8ec009d43855592ed931544ebc1eb9a75fcc583';
    // const callerId = '073-146-26367'


    const username = '10e944946fac33d5abd435b3b108677c1fcc9977380f2304';
    const password = 'd6657a2de6e0f65e4bb2eb5ae0be12f7e377b48185038a42';
    const callerId = '011-408-6705'

    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

    const payload = new FormData()
    payload.append('From', `+91${customer?.phoneNumber}`);
    payload.append('To', `+91${astrologer?.phoneNumber}`);
    // payload.append('To', `+91${}`);
    payload.append('StatusCallback', 'https://astrooneapi.ksdelhi.net/api/customers/call_status_response');
    payload.append('CallerId', callerId);
    payload.append('StatusCallbackContentType', 'application/json');
    payload.append('TimeLimit', maxDuration);
    payload.append('StatusCallbackEvents[0]', 'answered');
    payload.append('StatusCallbackEvents[1]', 'terminal');


    // console.log(payload, "Check payload")

    const exotelResponse = await axios({
      method: 'post',
      url: `https://api.exotel.com/v1/Accounts/astroremedy2/Calls/connect.json`,
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'multipart/form-data'
      },
      data: payload
    })

    // console.log(exotelResponse.data, "Check Exotels Response data")

    const newCall = new CallHistory({
      formId: formId,
      customerId: customerId,
      astrologerId: astrologerId,
      callPrice: callPrice,
      transactionId: exotelResponse.data?.Call?.Sid,
      startTime: new Date(),
      commissionPrice: parseFloat(astrologer?.commission_call_price),
    });

    astrologer.call_status = 'busy'
    astrologer.chat_status = 'busy'
    astrologer.video_call_status = 'busy'

    await astrologer.save()
    await newCall.save();

    database.ref(`CurrentCall/${astrologerId}`).set({
      formId,status:1
    })

    res.status(200).json({
      success: true,
      message: "Data retrieved and saved successfully",
      // newCall,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.callStatusResponse = async (req, res) => {
  try {
    // save file
    const filePath = path.join(__dirname, 'exotel_response.json');

      // Convert the data to a JSON string
      const jsonData = JSON.stringify(req.body, null, 2); // Pretty-print with 2 spaces

      // Write the JSON string to the file
      fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
          return console.error('Error writing file:', err);
        }
        console.log('Data saved to JSON file successfully.');
      });

      const { CallSid, Status, DateUpdated, EventType, ConversationDuration } = req.body;
      // console.log(req.body)
      const callData = await CallHistory.findOne({ transactionId: CallSid })
      
      if (EventType == 'terminal' && Status == 'completed') {
      
      database.ref(`CurrentCall/${callData?.astrologerId}`).set({
        formId: callData?.astrologerId ,status:1
      })

      const customer = await Customers.findById(callData?.customerId)
      const astrologer = await Astrologer.findById(callData?.astrologerId)

      const duration = ConversationDuration / 60
      
      const deductAmount = callData?.callPrice * duration
      const adminPrice = callData?.commissionPrice * duration
      const astroPrice = deductAmount - adminPrice

      const date1 = new Date(astrologer?.today_earnings?.date);
      const date2 = new Date();

      const sameDay = date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();


      if (sameDay) {
        astrologer.today_earnings = {
          date: new Date(),
          earnings: astrologer.today_earnings?.earnings + astroPrice
        }
      } else {
        astrologer.today_earnings = {
          date: new Date(),
          earnings: astroPrice
        }
      }

      customer.wallet_balance -= deductAmount;
      astrologer.wallet_balance += astroPrice;
      callData.status = 'Completed';
      callData.durationInSeconds = ConversationDuration,
      callData.endTime = new Date()
      callData.totalCallPrice = astroPrice + adminPrice
      callData.commissionPrice = adminPrice
      astrologer.call_status = 'online'
      astrologer.chat_status = 'online'
      astrologer.video_call_status = 'online'

      const totalWalletRecharge = (await RechargeWallet.find()).length;
      const totalAstrologerWallet = (await AstrologerWallet.find()).length;

      const customerInvoiceId = `#ASTROONE${totalWalletRecharge}`;
      const astrologerInvoiceId = `#ASTROONE${totalAstrologerWallet}`;

      const adminEarnings = new AdminEarning({
        type: "call",
        astrologerId: callData?.astrologerId,
        customerId: callData?.customerId,
        transactionId: callData?.transactionId,
        totalPrice: deductAmount,
        adminPrice: adminPrice,
        partnerPrice: astroPrice,
        historyId: callData?._id,
        duration: ConversationDuration,
        startTime: callData?.startTime,
        endTime: new Date().getTime().toString(),
      });

      const customerWalletHistory = {
        customer: callData?.customerId,
        referenceId: callData?._id,
        referenceModel: 'CallHistory',
        invoiceId: customerInvoiceId,
        gst: 18,
        recieptNumber: totalWalletRecharge + 1,
        discount: "",
        offer: "",
        totalAmount: "",
        amount: deductAmount,
        paymentMethod: "Online",
        transactionType: 'DEBIT',
        type: 'CALL'
      };

      const astrolgoerWalletHistory = {
        astrologerId: callData?.astrologerId,
        referenceId: callData?._id,
        referenceModel: 'CallHistory',
        invoiceId: astrologerInvoiceId,
        gst: 0,
        recieptNumber: totalAstrologerWallet + 1,
        totalAmount: 0,
        amount: astroPrice,
        paymentMethod: "Online",
        transactionType: 'CREDIT',
        type: 'CALL'
      };

      const newCustomerWallet = new RechargeWallet(customerWalletHistory)
      const newAstrologerWallet = new AstrologerWallet(astrolgoerWalletHistory)

      await customer.save()
      await astrologer.save()
      await adminEarnings.save()
      await newCustomerWallet.save()
      await newAstrologerWallet.save()
      await callData.save()

      database.ref(`CurrentCall/${callData?.astrologerId}`).remove()

      const call = {
        invoice: {
          _id: callData._id, // Assuming callData._id is available after save
          formId: callData.formId,
          customerId: callData.customerId,
          customerInvoice: customerInvoiceId,
          astrologerId: callData.astrologerId,
          astrologerInvoice: astrologerInvoiceId,
          startTime: callData.startTime.toISOString(), // Ensure date is in string format
          endTime: callData.endTime.toISOString(),     // Ensure date is in string format
          durationInSeconds: callData.durationInSeconds,
          callPrice: callData.callPrice,
          commissionPrice: callData.commissionPrice,
          totalCallPrice: callData.totalCallPrice,
          status: callData.status,
          transactionId: callData.transactionId,
          callId: callData.callId,
          createdAt: callData.createdAt.toISOString(),  // Ensure date is in string format
          updatedAt: callData.updatedAt.toISOString(),  // Ensure date is in string format
          __v: callData.__v,
          astrologer: {
            _id: astrologer?._id,
            astrologerName: astrologer?.astrologerName,
            profileImage: astrologer?.profileImage,
          }
        },
        
      };



      const deviceToken = customer.fcmToken;
      const astrologerDeviceToken = astrologer.fcmToken;

      //token for web
      const astrologerWebFcmToken = astrologer.webFcmToken
      const customerWebFcmToken = customer.webFcmToken

      const title = 'Call Invoice generated for call';

      const notification = {
        title,
        body: "Call Invoice generated",
      };
      const data = {
        title,
        body: "Call Invoice generated",
        call: {
          invoice: call,
        },
        type: "call_invoice",
        priority: "high",
      };




      const astroNotification = {
        type: "update_status",
        priority: "high",
      };

      // await notificationService.sendNotification(
      //   astrologer?.fcmToken,
      //   undefined,
      //   {type: 'update_status'}
      // );
      console.log(' ::::: ',deviceToken, notification, data);
      setTimeout(async () => {
        try {
          
          
          await notificationService.sendNotification(customerWebFcmToken, notification, data);
          await notificationService.sendNotification(astrologerWebFcmToken, undefined, astroNotification);
          await notificationService.sendNotification(deviceToken, notification, data);
          await notificationService.sendNotification(astrologerDeviceToken, undefined, astroNotification);
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }, 3000);




    } else if (Status == 'busy' || Status == 'no-answer' || Status == 'failed') {
      const astrologer = await Astrologer.findById(callData?.astrologerId)
      const customer = await Customers.findById(callData?.customerId)
      callData.status = 'Not Connected'
      astrologer.call_status = 'online'
      astrologer.chat_status = 'online'
      astrologer.video_call_status = 'online'
      await astrologer.save()
      database.ref(`CurrentCall/${callData?.astrologerId}`).remove()

      const deviceToken = customer.fcmToken;

      const title = 'Call not connected';

      const notification = {
        title,
        body: "Call not connected",
      };

      const data = {
        call: callData,
        type: "call_not_connected",
        priority: "high",
      };

      await notificationService.sendNotification(
        deviceToken,
        notification,
        data
      );


    } else if (Status == 'in-progress') {
      callData.status = 'Ongoing'
    }

    await callData.save()



    // const callData = await CallHistory.findOne({ transactionId: trans_id });
    // const hashedStr = sha1(tmpStr); // Assuming you have a sha1 function available.
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

// intitate chat
// exports.initiateChat = async (req, res) => {
//   try {
//     const { formId, customerId, astrologerId, chatPrice } = req.body;

//     // Fetch customer data
//     const customer = await Customers.findById(customerId);
//     if (!customer) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Customer not found" });
//     }

//     // Fetch astrologer data
//     const astrologer = await Astrologer.findById(astrologerId);
//     if (!astrologer) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Astrologer not found" });
//     }


//     // Fetch data from LinkedProfile based on provided formId and customerId association
//     const linkedProfile = await LinkedProfile.findOne({
//       _id: formId,
//       customerId: customerId,
//     });

//     if (astrologer.chat_status != 'online') {
//       return res.status(200).json({
//         success: false,
//         message: `Astrologer is ${astrologer.chat_status}`,
//       });
//     }

//     if (!linkedProfile) {
//       return res.status(404).json({
//         success: false,
//         message: "LinkedProfile not found for this Customer ID and ID",
//       });
//     }

//     const totalChat = await ChatHistory.find();
//     let inoiceId = "ASTROBOOSTER" + totalChat.length.toString();

//     const newChat = new ChatHistory({
//       formId,
//       customerId,
//       astrologerId,
//       chatPrice,
//       transactionId: inoiceId,
//       commissionPrice: astrologer?.commission_chat_price,
//     });

//     // Save the new call entry to the database
//     if (astrologer?.chat_notification) {

//       const astrologerFCMToken = astrologer?.fcmToken;
//       // const astrologerWEBFCMToken = astrologer?.webFcmToken;

//       const deviceToken = astrologerFCMToken;
//       // const webDeviceToken = astrologerWEBFCMToken;

//       const title = `Chat request from ${customer?.customerName || "a customer"
//         }`;

//       const notification = {
//         title,
//         body: "Customer is Requesting for chat",
//       };

//       const data = {
//         customerName: customer?.customerName,
//         customerImage: customer?.image,
//         user_id: customerId,
//         wallet_balance: customer?.wallet_balance,
//         type: "chat_request",
//         priority: "High",
//         invoiceId: inoiceId,
//         astroID: astrologerId,
//         chatId: newChat._id,
//         profileId: formId,
//         chatPrice: chatPrice
//       };

//       await notificationService.sendNotification(
//         deviceToken,
//         // webDeviceToken,
//         notification,
//         data
//       );
//     }

//     astrologer.chat_status = 'busy'
//     astrologer.call_status = 'busy'

//     await astrologer.save()
//     await newChat.save();

//     database.ref(`ChatRequest/${astrologerId}`).set({
//       customerId,
//       formId,
//       status: 'inactive',
//       kundliId: ''
//     })

//     const maxDuration = parseInt(customer.wallet_balance / chatPrice) * 60

//     res.status(200).json({
//       success: true,
//       message: "Data retrieved and saved successfully",
//       newChat,
//       duration: maxDuration
//     });

//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch data",
//       error: error.message,
//     });
//   }
// };

// exports.initiateChat = async (req, res) => {
//   try {
//     const { formId, customerId, astrologerId, chatPrice } = req.body;

//     // Fetch customer data
//     const customer = await Customers.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({ success: false, message: "Customer not found" });
//     }

//     // Fetch astrologer data
//     const astrologer = await Astrologer.findById(astrologerId);
//     if (!astrologer) {
//       return res.status(404).json({ success: false, message: "Astrologer not found" });
//     }

//     // Fetch data from LinkedProfile based on provided formId and customerId association
//     const linkedProfile = await LinkedProfile.findOne({
//       _id: formId,
//       customerId: customerId,
//     });

//     // Check astrologer status
//     if (astrologer.chat_status !== 'online') {
//       return res.status(200).json({
//         success: false,
//         message: `Astrologer is ${astrologer.chat_status}`,
//       });
//     }

//     if (!linkedProfile) {
//       return res.status(404).json({
//         success: false,
//         message: "LinkedProfile not found for this Customer ID and ID",
//       });
//     }

//     // Generate unique invoice ID
//     const totalChats = await ChatHistory.countDocuments();
//     const invoiceId = `ASTROBOOSTER${totalChats}`;

//     // Create a new ChatHistory entry
//     const newChat = new ChatHistory({
//       formId,
//       customerId,
//       astrologerId,
//       chatPrice,
//       transactionId: invoiceId,
//       commissionPrice: astrologer.commission_chat_price,
//     });

//     // Save the new chat entry to the database
//     await newChat.save();

//     // Send notifications to both mobile and web
//     const title = `Chat request from ${customer.customerName || "a customer"}`;
//     const notification = {
//       title,
//       body: "Customer is requesting a chat",
//     };

//     const data = {
//       customerName: customer.customerName,
//       customerImage: customer.image,
//       user_id: customerId,
//       wallet_balance: customer.wallet_balance,
//       type: "chat_request",
//       priority: "High",
//       invoiceId: invoiceId,
//       astroID: astrologerId,
//       chatId: newChat._id,
//       profileId: formId,
//       chatPrice: chatPrice,
//     };

//     // Assuming notificationService.sendNotification handles both mobile and web notifications
//     await notificationService.sendNotification(astrologer.fcmToken, notification, data);
//     await notificationService.sendNotification(astrologer.webFcmToken, notification, data);

//     // Update astrologer status to busy
//     astrologer.chat_status = 'busy';
//     astrologer.call_status = 'busy';
//     await astrologer.save();

//     // Update ChatRequest in Firebase
//     database.ref(`ChatRequest/${astrologerId}`).set({
//       customerId,
//       formId,
//       status: 'inactive',
//       kundliId: '',
//     });

//     // Calculate maximum chat duration based on customer's wallet balance
//     const maxDuration = parseInt(customer.wallet_balance / chatPrice) * 60;

//     res.status(200).json({
//       success: true,
//       message: "Data retrieved and saved successfully",
//       newChat,
//       duration: maxDuration,
//     });

//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch data",
//       error: error.message,
//     });
//   }
// };

exports.initiateChat = async (req, res) => {
  try {
    const { formId, customerId, astrologerId, chatPrice } = req.body;

    // Fetch customer data
    const customer = await Customers.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    console.log("guifhgi", customerId);
    // Fetch astrologer data
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // Fetch data from LinkedProfile based on provided formId and customerId association
    const linkedProfile = await LinkedProfile.findOne({
      _id: formId,
      customerId: customerId,
    });

    // Check astrologer status
    if (astrologer.chat_status !== 'online') {
      return res.status(200).json({
        success: false,
        message: `Astrologer is ${astrologer.chat_status}`,
      });
    }

    if (!linkedProfile) {
      return res.status(404).json({
        success: false,
        message: "LinkedProfile not found for this Customer ID and ID",
      });
    }

    // Generate unique invoice ID
    const totalChats = await ChatHistory.countDocuments();
    const invoiceId = `ASTROONE${totalChats}`;

    // Create a new ChatHistory entry
    const newChat = new ChatHistory({
      formId,
      customerId,
      astrologerId,
      chatPrice,
      transactionId: invoiceId,
      commissionPrice: astrologer.commission_chat_price,
    });

    // Save the new chat entry to the database
    await newChat.save();

    // Send notifications to both mobile and web
    const title = `Chat request from ${customer.customerName || "a customer"}`;
    const notification = {
      title,
      body: "Customer is requesting a chat",
    };

    const data = {
      title: "New Chat Request",
      body: `Chat request from ${customer?.customerName || "a customer"}`,
      customerName: customer?.customerName,
      customerImage: customer?.image,
      user_id: customerId,
      wallet_balance: customer?.wallet_balance.toString(),
      type: "chat_request",
      priority: "High",
      invoiceId: invoiceId,
      astroID: astrologerId,
      chatId: newChat._id.toString(),
      historyId: newChat._id.toString(),
      profileId: formId,
      chatPrice: chatPrice.toString(),
      sent_to: 'astrologer'
    };

    // Send notification to astrologer's mobile
    await notificationService.sendNotification(astrologer.fcmToken, notification, data);

    // Check if webFcmToken exists and send notification to astrologer's web platform
    if (astrologer.webFcmToken) {
      await notificationService.sendNotification(astrologer.webFcmToken, notification, data);
    }

    // Update astrologer status to busy
    astrologer.chat_status = 'busy';
    astrologer.call_status = 'busy';
    astrologer.video_call_status = 'busy'
    await astrologer.save();

    // Update ChatRequest in Firebase
    database.ref(`ChatRequest/${astrologerId}`).set({
      customerId,
      formId,
      status: 'inactive',
      kundliId: '',
    });

    // Calculate maximum chat duration based on customer's wallet balance
    const maxDuration = parseInt(customer.wallet_balance / chatPrice) * 60;

    setTimeout(async () => {
      const chatData = await ChatHistory.findById(newChat._id)
      if (chatData?.status == 'Created') {
        const astrologer = await Astrologer.findById(astrologerId);
        chatData.status = 'Not Connected'
        astrologer.chat_status = 'online'
        astrologer.call_status = 'online'
         astrologer.video_call_status = 'online'
        await astrologer.save()
        await chatData.save()
        await notificationService.sendNotification(
          astrologer?.fcmToken,
          null,
          {type: 'call_status'}
        );
      }
    }, 1000 * 60 * 1.5)

    res.status(200).json({
      success: true,
      message: "Data retrieved and saved successfully",
      newChat,
      duration: maxDuration,
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};


exports.acceptChat = async (req, res) => {
  try {
    const { chatId } = req.body
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chatId" });
    }
    const chatData = await ChatHistory.findById(chatId)
    const customer = await Customers.findById(chatData?.customerId)
    const astrologer = await Astrologer.findById(chatData?.astrologerId)
    const deviceToken = customer?.fcmToken;

    const title = `Chat request from ${astrologer?.astrologerName || "a astrologer"
      }`;

    const notification = {
      title,
      body: "Astrologer is Requesting for chat",
    };
    const data = {
      user_id: chatData?.customerId.toString(),
      type: "chat_request",
      priority: "High",
      astroID: chatData?.astrologerId.toString(),
      chatId: chatId,
      chatPrice: chatData?.chatPrice.toString(),
      astrologerName: astrologer?.astrologerName,
      profileImage: astrologer?.profileImage,
      sent_to: 'customer'
    };

    console.log(data)

    await notificationService.sendNotification(
      deviceToken,
      notification,
      data
    );

    res.status(200).json({
      success: true,
      message: "Accepted Success",
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.rejectChat = async (req, res) => {
  try {
    const { chatId } = req.body
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chatId" });
    }
    const chatData = await ChatHistory.findById(chatId)
    const astrologer = await Astrologer.findById(chatData?.astrologerId)
    astrologer.call_status = 'online'
    astrologer.chat_status = 'online'
     astrologer.video_call_status = 'online'
    chatData.status = 'Not Connected'
    await astrologer.save()
    await chatData.save()

    res.status(200).json({
      success: true,
      message: "Chat Request Rejected",
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};


exports.updateChatStatus = async (req, res) => {
  try {
    const { chatId, status, updateBy } = req.body;

    // Fetch customer data
    const chatData = await ChatHistory.findById(chatId);
    if (!chatData) {
      return res
        .status(404)
        .json({ success: false, message: "chat not found" });
    }

    const astrologer = await Astrologer.findById(chatData?.astrologerId)

    if (updateBy == 'customer') {
      if (status == 'reject') {
        astrologer.chat_status = 'online'
        astrologer.call_status = 'online'
        astrologer.video_call_status = 'online'
        chatData.status = 'Not Connected'
      } else {
        chatData.status = 'Ongoing'
      }
    } else {
      if (status == 'reject') {
        astrologer.chat_status = 'online'
        astrologer.call_status = 'online'
        astrologer.video_call_status = 'online'
        chatData.status = 'Not Connected'
      } else {

      }
    }

    await astrologer.save()
    await newChat.save();

    database.ref(`ChatRequest/${astrologerId}`).set({
      customerId,
      formId,
      status: 'inactive',
      kundliId: ''
    })



    res.status(200).json({
      success: true,
      message: "Data retrieved and saved successfully",
      newChat,
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

// Customer chat history
exports.chatHistoryOfCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;

    // Find all chat history entries associated with the provided Customer id
    const chatHistory = await ChatHistory.find({
      customerId,
      durationInSeconds: { $exists: true, $ne: "" },
    })
      .populate({
        path: "formId", // Assuming 'formId' is the field referencing LinkedProfile
        select: "-_id -__v", // Exclude fields like id and _v from LinkedProfile
      })
      .populate({
        path: "astrologerId",
        select:
          "_id astrologerName gender profileImage phoneNumber chat_price commission_chat_price", // Exclude fields like id and _v from LinkedProfile
      }).sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: "Chat history found",
      chatHistory,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

exports.getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.body;

    // Find all chat history entries associated with the provided Customer id
    const chatHistory = await ChatHistory.findById(chatId)
      .populate({
        path: "formId", // Assuming 'formId' is the field referencing LinkedProfile
        select: "-__v", // Exclude fields like id and _v from LinkedProfile
      }).populate({
        path: "customerId",
        select: "customerName image wallet_balance"
      })
      .populate({
        path: "astrologerId",
        select:
          "_id astrologerName gender profileImage", // Exclude fields like id and _v from LinkedProfile
      });

    res.status(200).json({
      success: true,
      message: "Chat history found",
      chatHistory,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

exports.calculateAndDeductCallPrice = async (req, res) => {
  try {
    const { callHistoryId, startTime, endTime, duration } = req.body;

    // const startDate = new Date(startTime);
    // const endDate = new Date(endTime);

    // let startDate, endDate;

    const existingCallHistory = await CallHistory.findById(callHistoryId);
    if (!existingCallHistory) {
      return res
        .status(404)
        .json({ success: false, message: "Call history not found" });
    }

    const astrologer = await Astrologer.findById(
      existingCallHistory.astrologerId
    );
    if (!astrologer) {
      return res
        .status(404)
        .json({ success: false, message: "Astrologer not found" });
    }

    // if (astrologer.chat_price === undefined || astrologer.chat_price === null) {
    //   return res.status(400).json({ success: false, message: 'Chat price not defined for the astrologer' });
    // }

    const durationInSeconds = duration;

    const customer = await Customers.findById(existingCallHistory.customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const callPricePerMin = existingCallHistory.callPrice; // Assuming price is per minute
    const totalCallPrice = parseFloat(
      ((durationInSeconds / 60) * callPricePerMin).toFixed(2)
    );

    // Deduct balance from the Customer schema
    customer.wallet_balance -= totalCallPrice;

    // Update Customer's wallet balance
    await customer.save();

    //  call history data stored
    const callHistory = new CallHistory({
      startTime,
      endTime,
      durationInSeconds,
      totalCallPrice,
    });

    // Save call history entry
    await callHistory.save();

    // Update Astrologer's wallet balance
    astrologer.wallet_balance += totalCallPrice;
    await astrologer.save();

    res.status(200).json({
      success: true,
      message: "Call price deducted and added to astrologer successfully",
      remainingBalance: customer.wallet_balance.toFixed(2),
    });
  } catch (error) {
    console.error("Error deducting call price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deduct call price",
      error: error.message,
    });
  }
};

// Customer Call history
exports.CallHistoryOfCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;

    // Find all chat history entries associated with the provided Customer id
    const callHistory = await CallHistory.find({
      customerId,
    }).sort({ _id: -1 });

    const enhancedHistory = await Promise.all(
      callHistory.map(async (item) => {
        const { customerId, astrologerId, formId } = item;

        // Specify the fields to populate from the Customer and Astrologer models
        const astrologerDetails = await Astrologer.findById(
          astrologerId,
          "astrologerName profileImage gender"
        );
        const intakeDetailes = await LinkedProfile.findById(formId);

        return {
          _id: item._id,
          formId: item.formId,
          customerId,
          astrologerId,
          astrologerDetails,
          intakeDetailes,
          transactionId: item?.transactionId,
          callId: item?.callId,
          startTime: item.startTime,
          endTime: item.endTime,
          durationInSeconds: item.durationInSeconds,
          callPrice: item.callPrice,
          totalCallPrice: item.totalCallPrice,
          status: item?.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          __v: item.__v,
        };
      })
    );

    if (enhancedHistory) {
      return res.status(200).json({
        success: true,
        history: enhancedHistory,
      });
    }
  } catch (error) {
    console.error("Error fetching Call history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Call history",
      error: error.message,
    });
  }
};

exports.customerHomeBanner = async function (req, res) {
  try {
    // Fetch all Banners from the database
    const banners = await Banners.find({
      bannerFor: "app",
      redirectTo: "customer_home",
      status: 'active'
    });

    // Return the list of Banners as a JSON response
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Banners",
      error: error.message,
    });
  }
};

exports.astrologerDetailesBanner = async function (req, res) {
  try {
    // Fetch all Banners from the database
    const banners = await Banners.find({
      bannerFor: "app",
      redirectTo: "astrologer_profile",
    });

    // Return the list of Banners as a JSON response
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Banners",
      error: error.message,
    });
  }
};

exports.getCustmerNotification = async function (req, res) {
  const { customerId } = req.body;

  try {
    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, message: "CustomerId is required." });
    }

    const notification = await CustomerNotification.find({
      "customerIds.customerId": customerId,
    });

    if (!notification || notification.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Linked profile data not found for the given customerId.",
      });
    }

    let unreadMessage = 0;

    const enhancedHistory = await Promise.all(
      notification.map(async (item) => {
        let notificationStatus;
        for (read of item?.customerIds) {
          if (read?.customerId == customerId) {
            notificationStatus = read?.notificationRead;
            if (!notificationStatus) {
              unreadMessage++;
            }
            break;
          }
        }
        return {
          _id: item._id,
          title: item?.title,
          description: item?.description,
          image: item?.image,
          notificationStatus,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          __v: item.__v,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enhancedHistory,
      unreadMessage: unreadMessage,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

exports.updateCustomerNotification = async function (req, res) {
  try {
    const { customerId, notificationId } = req.body;
    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, message: "CustomerId is required." });
    }

    const notification = await CustomerNotification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // Check if notification has customerIds property
    if (!notification.customerIds || !Array.isArray(notification.customerIds)) {
      return res.status(500).json({
        success: false,
        message: "Invalid notification data.",
      });
    }

    for (const d of notification.customerIds) {
      if (d.customerId == customerId) {
        d.notificationRead = true;
        break;
      }
    }
    await notification.save();
    res.status(200).json({ success: true, message: "Updated" });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

exports.initateLiveStreaming = async (req, res) => {
  try {
    const { astrologerId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid astrologerId" });
    }

    const astrologer = await Astrologer.findById(astrologerId)

    if (!astrologer) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid astrologerId" });
    }


    const totalChat = await LiveStreaming.find().countDocuments();
    let liveId = "ASTROONE_LIVE_" + totalChat.toString();

    const liveStreaming = new LiveStreaming({
      astrologerId,
      liveId,
      vedioCallPrice: astrologer?.video_call_price + astrologer?.commission_video_call_price,
      commissionVedioCallPrice: astrologer?.commission_video_call_price,
      voiceCallPrice: 2
    })

    await liveStreaming.save()

    return res
      .status(200)
      .json({ success: true, liveId });


  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.createLiveRoom = async (req, res) => {
  try {
    const {
      appid,
      event,
      nonce,
      room_id,
      room_session_id,
      room_create_time,
      signature,
      timestamp,
      id_name,
    } = req.body;
    const secret = '43ba6854ca9e61a0cc718a494589f0a6'; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "room_create") {
      const roomData = await LiveStreaming.findOne({ liveId: room_id })
      const astrologer = await Astrologer.findById(roomData?.astrologerId)
      roomData.status = 'Ongoing';
      roomData.startTime = new Date();
      astrologer.chat_status = 'busy'
      astrologer.call_status = 'busy';
      astrologer.video_call_status = 'busy'
      astrologer.nextOnline = {
        date: null,
        time: null
      }

      await roomData.save()
      await astrologer.save()

      const liveAstrologer = await LiveStreaming.findOne({ liveId: room_id }).populate({
        path: "astrologerId",
        select:
          "_id astrologerName gender profileImage phoneNumber",
      })
      database.ref(`LiveStreaming/${room_id}`).set({
        WaitingList: "null",
        coHostData: "null"
      })

      const astro = JSON.stringify(liveAstrologer)

      database.ref(`LiveAstro/${room_id}`).set(astro)

      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.endLiveStreaming = async (req, res) => {
  try {
    const {
      appid,
      event,
      nonce,
      room_id,
      room_session_id,
      room_close_time,
      signature,
      timestamp,
      id_name,
    } = req.body;
    const secret = '43ba6854ca9e61a0cc718a494589f0a6'; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "room_close") {
      const roomData = await LiveStreaming.findOne({ liveId: room_id })
      const astrologer = await Astrologer.findById(roomData?.astrologerId)
      roomData.status = 'Completed';
      roomData.endTime = new Date();
      astrologer.chat_status = 'online'
      astrologer.call_status = 'online'
      astrologer.video_call_status = 'online'
      await roomData.save()
      await astrologer.save()
      database.ref(`LiveStreaming/${room_id}`).remove();
      database.ref(`LiveAstro/${room_id}`).remove()
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.stopLiveStreaming = async (req, res) => {
  try {
    const {
      appid,
      event,
      nonce,
      room_id,
      room_session_id,
      room_close_time,
      signature,
      timestamp,
      id_name,
    } = req.body;

    const secret = '43ba6854ca9e61a0cc718a494589f0a6'; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "room_close") {
      const roomData = await LiveStreaming.findOne({ liveId: room_id })
      roomData.status = 'Completed';
      roomData.endTime = new Date()
      await roomData.save()
      database.ref(`LiveStreaming/${room_id}`).remove();
      database.ref(`LiveAstro/${room_id}`).remove()
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.getLiveStreaming = async (req, res) => {
  try {

    const liveAstrologer = await LiveStreaming.find({ status: 'Ongoing' }).populate({
      path: "astrologerId",
      select:
        "_id astrologerName gender profileImage phoneNumber",
    })

    return res
      .status(200)
      .json({ success: true, liveAstrologer });


  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.getRecentLiveStreaming = async (req, res) => {
  try {

    const results = await LiveStreaming.aggregate([
      { $match: { status: 'Completed' } }, // Match documents with status 'Completed'
      { $sort: { endTime: -1 } }, // Sort by endTime in descending order
      {
        $group: {
          _id: '$astrologerId', // Group by astrologerId
          latestEntry: { $first: '$$ROOT' } // Take the first document in each group (which is the latest due to sorting)
        }
      },
      { $replaceRoot: { newRoot: '$latestEntry' } }, // Replace the root with the latestEntry document
      {
        $lookup: {
          from: 'Astrologer', // The collection to join with
          localField: 'astrologerId',
          foreignField: '_id',
          as: 'astrologerDetails'
        }
      },
      { $unwind: '$astrologerDetails' }, // Unwind the joined astrologer details
      {
        $project: {
          _id: 1,
          astrologerId: 1,
          liveId: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          astrologerName: '$astrologerDetails.astrologerName',
          profileImage: '$astrologerDetails.profileImage'
        }
      },
      { $limit: 5 } // Limit to 5 results
    ]);

    return res
      .status(200)
      .json({ success: true, results });


  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};


exports.sendGiftInLiveStreaming = async (req, res) => {
  try {

    const { liveId, customerId, giftId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(giftId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid customerId or giftId" });
    }

    const customer = await Customers.findById(customerId)
    const gift = await Gift.findById(giftId)
    const liveData = await LiveStreaming.findOne({ liveId })
    const astrologer = await Astrologer.findById(liveData?.astrologerId)

    function GenerateUASignature(appId, signatureNonce, serverSecret, timeStamp) {
      const hash = crypto.createHash('md5'); //Use the MD5 hashing algorithm.
      var str = appId + signatureNonce + serverSecret + timeStamp;
      hash.update(str);
      //hash.digest('hex') indicates that the output is in hex format 
      return hash.digest('hex');
    }

    var signatureNonce = crypto.randomBytes(8).toString('hex');
    //Use the AppID and ServerSecret of your project.
    var appId = 1804652732;
    var serverSecret = "3521b485ea5a0c813eca88a4fe38077c";
    var timeStamp = Math.round(Date.now() / 1000);

    const signature = GenerateUASignature(appId, signatureNonce, serverSecret, timeStamp)

    const message = `${customer?.customerName} send ${gift.gift} gift.`
    const url = `https://rtc-api-bom.zego.im/?Action=SendBarrageMessage&AppId=${appId}&RoomId=${liveId}&UserId=${customerId}&UserName=${customer?.customerName ?? 'User'}&MessageCategory=${2}&MessageContent=${message}&Signature=${signature}&SignatureNonce=${signatureNonce}&SignatureVersion=${"2.0"}&Timestamp=${timeStamp}`
    const response = await postRequest({
      url: url,
      header: 'json',
    })

    if (response?.Code == 0) {
      let rechargeAmount = parseFloat(gift.amount);
      const priceToAdmin = rechargeAmount / 2
      const priceToAstrologer = rechargeAmount / 2

      astrologer.wallet_balance += priceToAstrologer
      customer.wallet_balance -= rechargeAmount;

      const totalWalletRecharge = (await RechargeWallet.find()).length;
      const totalAstrologerWallet = (await AstrologerWallet.find()).length;

      const customerInvoiceId = `#ASTROONE${totalWalletRecharge}`;
      const astrologerInvoiceId = `#ASTROONE${totalAstrologerWallet}`;

      const adminEarnings = new AdminEarning({
        type: "gift",
        giftId: giftId,
        astrologerId: liveData?.astrologerId,
        customerId: customerId,
        transactionId: liveId,
        totalPrice: rechargeAmount,
        adminPrice: priceToAdmin,
        partnerPrice: priceToAstrologer,
        historyId: liveId,
      });

      const customerWalletHistory = {
        customer: customerId,
        referenceId: giftId,
        referenceModel: 'Gift',
        invoiceId: customerInvoiceId,
        gst: 18,
        recieptNumber: totalWalletRecharge + 1,
        discount: "",
        offer: "",
        totalAmount: "",
        amount: rechargeAmount,
        paymentMethod: "Online",
        transactionType: 'DEBIT',
        type: 'GIFT'
      };

      const astrolgoerWalletHistory = {
        astrologerId: liveData?.astrologerId,
        referenceId: giftId,
        referenceModel: 'Gift',
        invoiceId: astrologerInvoiceId,
        gst: 0,
        recieptNumber: totalAstrologerWallet + 1,
        totalAmount: 0,
        amount: priceToAstrologer,
        paymentMethod: "Online",
        transactionType: 'CREDIT',
        type: 'GIFT'
      };

      const newCustomerWallet = new RechargeWallet(customerWalletHistory)
      const newAstrologerWallet = new AstrologerWallet(astrolgoerWalletHistory)

      const date1 = new Date(astrologer?.today_earnings?.date);
      const date2 = new Date();

      const sameDay = date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();

      if (sameDay) {
        astrologer.today_earnings = {
          date: new Date(),
          earnings: astrologer.today_earnings?.earnings + priceToAstrologer
        }
      } else {
        astrologer.today_earnings = {
          date: new Date(),
          earnings: priceToAstrologer
        }
      }

      await customer.save()
      await astrologer.save()
      await adminEarnings.save()
      await newCustomerWallet.save()
      await newAstrologerWallet.save()


      const updateCustomer = await Customers.findById(customerId)

      let giftData = {
        messageID: response?.Data?.MessageId,
        message: `You send ${gift.gift} gift.`,
        sendTime: new Date().getTime(),
        fromUser: {
          userID: customer?._id,
          userName: customer?.customerName,
        },
      };
      return res
        .status(200)
        .json({ success: true, gift: giftData, updateCustomer });
    }

    return res
      .status(200)
      .json({ success: false });


  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.createLiveCalls = async (req, res) => {
  try {
    const {
      appid,
      event,
      nonce,
      room_id,
      stream_id,
      create_time,
      signature,
      timestamp,
      hdl_url,
      pic_url,
      hls_url,
      rtmp_url,
      publish_name,
      publish_id,
      stream_sid,
      channel_id,
      title,
      user_id
    } = req.body;

    const secret = '43ba6854ca9e61a0cc718a494589f0a6'; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "stream_create" && room_id != stream_id) {
      const customer = await Customers.findById(user_id);
      const room = await LiveStreaming.findOne({ liveId: room_id });
      const astrologer = await Astrologer.findById(room?.astrologerId);

      const wallet = customer?.wallet_balance
      const callPrice = room?.vedioCallPrice

      const duration = parseInt((wallet / callPrice) * 60)

      const currentTime = new Date()

      const liveCalls = new LiveCalls({
        roomId: room?._id,
        streamId: stream_id,
        customerId: user_id,
        startTime: currentTime,
        maxDuration: duration,
      })

      await liveCalls.save()

      database.ref(`LiveStreaming/${room_id}/coHostData`).update({
        userID: customer?._id,
        streamID: stream_id,
        userName: customer?.customerName,
        img_url: customer?.image,
        startTime: new Date(currentTime).getTime(),
        totalDuration: duration,
      })

      const waitListRef = database.ref(`LiveStreaming/${room_id}/WaitingList`);
      const snapshot = await waitListRef
        .orderByChild('userID')
        .equalTo(user_id)
        .once('value');
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0]; // Assuming there's only one result
        database.ref(`LiveStreaming/${room_id}/WaitingList/${key}`).update({ callStarted: true })
        // await waitListRef.child(snapshot.key).update({ callStarted: true });
      }

      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.exitsFromLive = async (req, res) => {
  try {
    const {
      appid,
      event,
      nonce,
      room_id,
      user_account,
      signature,
      timestamp,
    } = req.body;
    const secret = '43ba6854ca9e61a0cc718a494589f0a6'; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "room_logout") {
      const waitListRef = database.ref(`LiveStreaming/${room_id}/WaitingList`);
      const snapshot = await waitListRef
        .orderByChild('userID')
        .equalTo(user_account)
        .once('value');
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0]; // Assuming there's only one result
        database.ref(`LiveStreaming/${room_id}/WaitingList/${key}`).remove()
      }
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.endLiveCalls = async (req, res) => {
  try {
    const {
      appid,
      event,
      nonce,
      room_id,
      stream_id,
      signature,
      timestamp,
      stream_sid,
      channel_id,
      title,
      user_id,
      type
    } = req.body;
    const secret = '43ba6854ca9e61a0cc718a494589f0a6'; // Use the CallbackSecret obtained from the ZEGO Admin Console.
    const tmpArr = [secret, timestamp, nonce];
    const sortedArr = tmpArr.sort();
    const tmpStr = sortedArr.join("");
    const hashedStr = crypto.createHash("sha1").update(tmpStr).digest("hex"); // Assuming you have a sha1 function available.
    if (hashedStr === signature && event === "stream_close" && room_id != stream_id) {
      const liveCall = await LiveCalls.findOne({ streamId: stream_id })
      const customer = await Customers.findById(user_id);
      const room = await LiveStreaming.findOne({ liveId: room_id });
      const astrologer = await Astrologer.findById(room?.astrologerId);

      const startTime = new Date(liveCall?.startTime).getTime();
      const endTime = new Date().getTime()
      const totalSeconds = parseInt((endTime - startTime) / 1000)

      const totalDuration = totalSeconds / 60

      const deductedBalance = room?.vedioCallPrice * totalDuration;
      const priceToAdmin = room?.commissionVedioCallPrice * totalDuration
      const priceToAstrologer = deductedBalance - priceToAdmin

      

      const date1 = new Date(astrologer?.today_earnings?.date);
      const date2 = new Date();

      const sameDay = date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();

      if (sameDay) {
        astrologer.today_earnings = {
          date: new Date(),
          earnings: astrologer.today_earnings?.earnings + priceToAstrologer
        }
      } else {
        astrologer.today_earnings = {
          date: new Date(),
          earnings: priceToAstrologer
        }
      }

      customer.wallet_balance -= deductedBalance
      // astrologer.wallet_balance = (astrologer.wallet_balance || 0) + priceToAstrologer;
      astrologer.wallet_balance = (astrologer.wallet_balance || 0) + (priceToAstrologer || 0);
      liveCall.status = 'Completed'
      liveCall.amount = deductedBalance
      liveCall.endTime = new Date()
      liveCall.durationInSeconds = totalSeconds


      const totalWalletRecharge = (await RechargeWallet.find()).length;
      const totalAstrologerWallet = (await AstrologerWallet.find()).length;

      const customerInvoiceId = `#ASTROONE${totalWalletRecharge}`;
      const astrologerInvoiceId = `#ASTROONE${totalAstrologerWallet}`;

      const adminEarnings = new AdminEarning({
        type: "live_video_call",
        astrologerId: room?.astrologerId,
        customerId: user_id,
        transactionId: liveCall?.streamId,
        totalPrice: deductedBalance,
        adminPrice: priceToAdmin,
        partnerPrice: priceToAstrologer,
        historyId: liveCall?._id,
        duration: totalSeconds,
        startTime: liveCall?.startTime,
        endTime: new Date().getTime().toString(),
      });

      const customerWalletHistory = {
        customer: user_id,
        referenceId: liveCall?._id,
        referenceModel: 'LiveCalls',
        invoiceId: customerInvoiceId,
        gst: 18,
        recieptNumber: totalWalletRecharge + 1,
        discount: "",
        offer: "",
        totalAmount: "",
        amount: deductedBalance,
        paymentMethod: "Online",
        transactionType: 'DEBIT',
        type: 'LIVE_VEDIO_CALL'
      };

      const astrolgoerWalletHistory = {
        astrologerId: room?.astrologerId,
        referenceId: liveCall?._id,
        referenceModel: 'LiveCalls',
        invoiceId: astrologerInvoiceId,
        gst: 0,
        recieptNumber: totalAstrologerWallet + 1,
        totalAmount: 0,
        amount: priceToAstrologer,
        paymentMethod: "Online",
        transactionType: 'CREDIT',
        type: 'LIVE_VEDIO_CALL'
      };

      const newCustomerWallet = new RechargeWallet(customerWalletHistory)
      const newAstrologerWallet = new AstrologerWallet(astrolgoerWalletHistory)


      await liveCall.save()
      await customer.save()
      await adminEarnings.save()
      await newCustomerWallet.save()
      await newAstrologerWallet.save()
      await astrologer.save()

      const deviceToken = customer.fcmToken;

      const title = 'Live call invoice';

      const notification = {
        title,
        body: "Live call invoice generated",
      };

      const data = {
        title,
        body: "Live call invoice generated",
        liveCall: JSON.stringify({
          invoice: liveCall,
          customerInvoiceId: customerInvoiceId,
          astrologer: {
            _id: astrologer?._id,
            astrologerName: astrologer?.astrologerName,
            profileImage: astrologer?.profileImage,
          },
          vedioCallPrice: room?.vedioCallPrice
        }),
        type: "live_call_invoice",
        priority: "high",
      };

      await notificationService.sendNotification(
        deviceToken,
        notification,
        data
      );



      database.ref(`LiveStreaming/${room_id}`).update({
        coHostData: 'null',
      })

      const waitListRef = database.ref(`LiveStreaming/${room_id}/WaitingList`);
      const snapshot = await waitListRef
        .orderByChild('userID')
        .equalTo(user_id)
        .once('value');
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0]; // Assuming there's only one result
        database.ref(`LiveStreaming/${room_id}/WaitingList/${key}`).remove()
      }
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.getCustomerLiveCalls = async (req, res) => {
  try {
    const { customerId } = req.body
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid customerId" });
    }

    const history = await LiveCalls.find({ customerId }).populate({
      path: 'roomId',
      populate: {
        path: 'astrologerId',
        select: '_id astrologerName gender profileImage'
      },
    }).sort({ _id: -1 })

    return res
      .status(200)
      .json({ success: true, history });


  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.followAstrolgoer = async (req, res) => {
  try {
    const { customerId, astrologerId, action } = req.body
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid customerId" });
    }

    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid astrologerId" });
    }

    const astrologer = await Astrologer.findById(astrologerId)

    if (!astrologer) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid astrologerId" });
    }

    let astrologerFollowers = await AstrologerFollower.findOne({ astrologerId });

    if (!astrologerFollowers) {
      astrologerFollowers = new AstrologerFollower({ astrologerId, followers: [] });
    }

    if (action === 'follow') {
      if (!astrologerFollowers.followers.includes(customerId)) {
        astrologerFollowers.followers.push(customerId);
        astrologer.follower_count += 1
        await astrologerFollowers.save();
        await astrologer.save()
      }
      return res
        .status(200)
        .json({ success: true, message: 'Followed' });
    } else if (action === 'unfollow') {
      astrologerFollowers.followers = astrologerFollowers.followers.filter(followerId => followerId.toString() !== customerId);
      astrologer.follower_count -= 1
      await astrologerFollowers.save();
      await astrologer.save()
      return res
        .status(200)
        .json({ success: true, message: 'Unfollowed' });
    } else {
      return res
        .status(200)
        .json({ success: false, });
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.checkCustomerFollowing = async (req, res) => {
  try {
    const { customerId, astrologerId } = req.body
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid customerId" });
    }

    if (!mongoose.Types.ObjectId.isValid(astrologerId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid astrologerId" });
    }

    let astrologerFollowers = await AstrologerFollower.findOne({ astrologerId });

    if (!astrologerFollowers) {
      astrologerFollowers = new AstrologerFollower({ astrologerId, followers: [] });
    }

    const isFollowed = astrologerFollowers.followers.includes(customerId);

    if (isFollowed) {
      return res
        .status(200)
        .json({ success: true, follow: true });
    }

    return res
      .status(200)
      .json({ success: true, follow: false });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

exports.getCustomerFollowing = async (req, res) => {
  try {
    const { customerId } = req.body
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid customerId" });
    }

    const astrologers = await AstrologerFollower.find({ followers: customerId }).populate({
      path: 'astrologerId',
      select: 'astrologerName gender profileImage chat_price call_price language commission_call_price commission_chat_price' // Select only the name and profile image
    }).sort({ _id: -1 });

    const following = astrologers.map(follow => {
      const { astrologerName, profileImage, gender, _id, chat_price, call_price, language, commission_call_price, commission_chat_price } = follow.astrologerId;
      return { astrologerName, profileImage, gender, _id, chat_price, call_price, language, commission_call_price, commission_chat_price };
    });

    return res
      .status(200)
      .json({ success: true, following });


  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
};

// Match making of customer 

exports.matchMaking = async function (req, res) {
  try {
    const {
      customerId,
      male_name,
      male_timeOfBirth,
      male_dateOfBirth,
      male_placeOfBirth,
      female_name,
      female_timeOfBirth,
      female_dateOfBirth,
      female_placeOfBirth,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "customerId",
      "male_name",
      "male_timeOfBirth",
      "male_dateOfBirth",
      "male_placeOfBirth",
      "female_name",
      "female_timeOfBirth",
      "female_dateOfBirth",
      "female_placeOfBirth",
      "latitude",
      "longitude"
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide ${missingFields.join(", ")}.`,
      });
    }

    // Check if the customerId exists in the Customers collection
    const existingCustomer = await Customers.findById(customerId);

    if (!existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer does not exist. Profile cannot be added.",
      });
    }

    // Create a new profile in the MatchMaking collection
    const newMatchMaking = new MatchMaking({
      customerId,
      male_name,
      male_timeOfBirth,
      male_dateOfBirth,
      male_placeOfBirth,
      female_name,
      female_timeOfBirth,
      female_dateOfBirth,
      female_placeOfBirth,
      latitude,
      longitude,
      created_at: new Date() // Set created_at to the current timestamp
    });

    // Save the new profile to the database
    await newMatchMaking.save();

    res.status(201).json({
      success: true,
      message: "Matching data saved successfully.",
      data: newMatchMaking, // Access the newly saved document's _id
    });
  } catch (error) {
    console.error("Error saving Data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save matching data.",
      error: error.message,
    });
  }
};


exports.getMatch = async (req, res) => {
  const { customerId, gender } = req.body;

  try {
    // Validate required fields
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId in the request body.'
      });
    }

    let query = {
      customerId: customerId,
    };

    // Determine which gender fields to include based on the provided gender
    let selectFields = 'customerId female_name female_timeOfBirth female_dateOfBirth female_placeOfBirth male_name male_timeOfBirth male_dateOfBirth male_placeOfBirth latitude longitude created_at';

    if (gender) {
      if (gender === 'female') {
        query.female_name = { $exists: true };
        selectFields = 'customerId female_name female_timeOfBirth female_dateOfBirth female_placeOfBirth latitude longitude created_at';
      } else if (gender === 'male') {
        query.male_name = { $exists: true };
        selectFields = 'customerId male_name male_timeOfBirth male_dateOfBirth male_placeOfBirth latitude longitude created_at';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender. Please provide either "male" or "female".'
        });
      }
    }

    // Find documents in Numerology collection matching the query and project specific fields
    const profiles = await MatchMaking.find(query).select(selectFields);

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No matching profiles found for customerId ${customerId}.`
      });
    }

    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles.',
      error: error.message
    });
  }
};

exports.getAllMatch = async function (req, res) {
  try {
    // Fetch all Customer from the database
    const matchMaking = await MatchMaking.find();

    // Return the list of Customer as a JSON response
    res.status(200).json({ success: true, matchMaking });
  } catch (error) {
    console.error("Error fetching Customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Customers",
      error: error.message,
    });
  }
};

// Numerology customer 

exports.userNumerology = async (req, res) => {
  try {
    const {
      customerId,
      name,
      time,
      date,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    const requiredFields = ["customerId", "name", "time", "date", "latitude",
      "longitude"];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide ${missingFields.join(", ")}.`,
      });
    }

    // Check if the customerId exists in the Customers collection
    const existingCustomer = await Customers.findById(customerId);
    if (!existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer does not exist. Profile cannot be added.",
      });
    }

    // Create a new Numerology profile
    const newNumerology = new NumerologyData({
      customerId,
      name,
      time,
      date,
      latitude,
      longitude,
      created_at: new Date() // Set created_at to the current timestamp
    });

    // Save the new Numerology profile to the database
    await newNumerology.save();

    res.status(201).json({
      success: true,
      message: "Numerology data saved successfully.",
      data: newNumerology,
    });
  } catch (error) {
    console.error("Error saving Numerology data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save Numerology data.",
      error: error.message,
    });
  }
};

exports.getNumerology = async (req, res) => {
  const { customerId } = req.body;

  try {
    // Validate required fields
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId in the request body.'
      });
    }

    // Query to find all documents matching customerId and gender
    const numerology = await NumerologyData.find({ customerId });

    if (!numerology || numerology.length === 0) {
      return res.status(404).json({
        success: true,
        message: `No numerology found for customerId ${customerId}.`
      });
    }

    res.status(200).json({
      success: true,
      data: numerology
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch numerology.',
      error: error.message
    });
  }
};



exports.deleteNumeroLogyById = async (req, res) => {

  try {
    const id = req.body.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "please provide id!" });
    }

    const deletedNumerologyData = await NumerologyData.findByIdAndDelete({ _id: id });

    if (!deletedNumerologyData) {
      return res
        .status(404)
        .json({ success: false, message: "id not found." });
    }

    res.status(200).json({
      success: true,
      message: "Numerology deleted successfully",
      deletedNumerologyData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Netword error' });
  }
}

exports.getAllNumerology = async function (req, res) {
  try {
    // Fetch all Customer from the database
    const numerology = await Numerology.find();

    // Return the list of Customer as a JSON response
    res.status(200).json({ success: true, numerology });
  } catch (error) {
    console.error("Error fetching Customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Customers",
      error: error.message,
    });
  }
};



// exports.getCustomerOrder = async (req, res)=>{
//   try{

//     const {customerId} = req.body;
//     if(!customerId || customerId == " "){
//        res.status(400).json({
//         success: false,
//         message: "please provide customerId!"
//        })
//     }

//     const orderData = await productOrder.find({customerId}).populate("products.productId", "productName image price description");
//     const orderProducts = orderData.map(cartItem => {
//       const quantity = cartItem.products[0]?.quantity
         
//       return {
//           product: cartItem.products[0]?.productId,
//           quantity: quantity,
//           status: cartItem.status,
//           amount: cartItem.amount,
//           createdAt: cartItem.createdAt

//       };
//   });

 
//        return res.status(200).json({
//         success: true,
//         message: 'Getting order data successfully',
//         data: orderProducts,
//       })
    

//   }

//   catch(error){
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     })
//   }
// }


exports.getCustomerOrder = async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId || customerId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide customerId!",
      });
    }

    const orderData = await productOrder.find({ customerId }).populate("products.productId", "productName image price description").populate('customerId', 'customerName');
    const date = new Date()
    const orderProducts = orderData.map(cartItem => {
      return {
        orderId: cartItem?.invoiceId || `#ASTROONE${date.toISOString().split('T')[0].replace(/-/g, '')}`,
        status: cartItem.status,
        totalAmount: cartItem.amount,
        createdAt: cartItem.createdAt,
        customer: cartItem.customerId,
        products: cartItem.products.map(product => ({
          productId: product.productId, // This is the populated product
          quantity: product.quantity,
        })),
      };
    }).flat();

    return res.status(200).json({
      success: true,
      message: 'Getting order data successfully',
      data: orderProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};






exports.orderDetailsById = async (req, res)=>{
  try{

    const {productId} = req.body;
    if(!productId || productId == " "){
       res.status(400).json({
        success: false,
        message: "please provide productId!"
       })
    }

    const orderData = await productOrder.find({productId:productId});
    
    return res.status(200).json({
      success: true,
      message: 'Getting detail successfully',
      data: orderData
    })
    

  }

  catch(error){
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

exports.videocallidgenerator = async function(req,res) {
  const {customerId, astrologerId,formId} = req.body;
  if(!customerId && !astrologerId) {
    res.status(400).json({ success: false, message: "required!"});
  }

  let uuid = crypto.randomUUID();

  const astrologer = await Astrologer.findById(astrologerId);
  const customer = await Customers.findById(customerId);
    if (!astrologer) {
      return res
        .status(404)
        .json({ success: false, message: "Astrologer not found" });
    }

    

  const data = new VideoCall({
    customerId: customerId,
    astrologerId: astrologerId,
    callId: uuid,
    videcallPrice: astrologer?.normal_video_call_price,
    videocommissionPrice: astrologer?.commission_normal_video_call_price,
    status: 'start'
  });

  // 

  database.ref(`CurrentCallVideo/${astrologerId}`).set({
    formId,status:1
  });

  data.save();

  astrologer.chat_status = 'busy';
  astrologer.call_status = 'busy';
  astrologer.video_call_status = 'busy';

  astrologer.save()

  const totolPrice = astrologer?.normal_video_call_price + astrologer?.commission_normal_video_call_price;
  const userWalletBalance = customer.wallet_balance;
  const talkTimeInMinutes = userWalletBalance / totolPrice;


  if(data) {
    return res.status(200).json({ success: true, message:"Fetch Data successfully", data: { // Include customer_balance in data object
      ...data.toObject(), // Convert mongoose object to plain object
      customer_balance: customer.wallet_balance,
      talkTimeInMinutes:talkTimeInMinutes
    }});
  } else {
    return res.status(404).json({ success: false, message: "Data Not found"});
  }

}

exports.endvideoCalls = async function(req, res) {
  const { callId } = req.body;

  if (!callId) {
    return res.status(400).json({ success: false, message: "callId is required!" });
  }

  try {
    // Find a single call record
    const callRecord = await VideoCall.findOne({ callId: callId });
    
    if (!callRecord) {
      return res.status(404).json({ success: false, message: "Call ID not found" });
    }

    const createdAt = new Date(callRecord.createdAt); // Convert createdAt to a Date object
    const nowTime = new Date(); // Current time
    const timeDifferenceInSeconds = Math.floor((nowTime - createdAt) / 1000);

    // Calculate the total cost
    const VideoCallPrice = callRecord.videcallPrice || 0;
    const VideoCallCommision = callRecord.videocommissionPrice || 0;
    const perMinuteCharge = VideoCallPrice + VideoCallCommision;
    const VideoCallTotal = parseInt(VideoCallPrice) + parseInt(VideoCallCommision);
    const durationInMinutes = timeDifferenceInSeconds / 60;
    // Convert minutes to seconds
    const durationInseconds = durationInMinutes * 60;
    const perSecondCharge = VideoCallTotal / 60;
    const perSecondAdminCharge = VideoCallCommision / 60;
    const perSecondAstrologerCharge = VideoCallPrice / 60;
    const calculatorVideoCall = durationInseconds * perSecondCharge;
    const calculatorVideoCallAdmin = durationInseconds * perSecondAdminCharge;
    const calculatorVideoCallAstrologer = durationInseconds * perSecondAstrologerCharge;
    

     // Ensure valid numbers before performing calculations
  if (isNaN(VideoCallPrice) || isNaN(VideoCallCommision)) {
    throw new Error("Invalid video call price or commission");
  }

    const customer = await Customers.findById(callRecord.customerId);
    // const astrologer = await Astrologer.findById(astrologerId);
    console.log(customer, "customer dataaa")

    if (!customer) {
      console.log("customer not found");
    }

    customer.wallet_balance -= parseFloat(calculatorVideoCall);

    await customer.save();

    const astrologer = await Astrologer.findById(callRecord?.astrologerId);
    // console.log(astrologer, "astrologer data")
 
    const chatAstroPrice = callRecord?.videcallPrice - callRecord?.videocommissionPrice
    // console.log(chatAstroPrice, "chatAstroPrice")
 
    if (isNaN(chatAstroPrice)) {
      throw new Error("Invalid chatAstroPrice");
    }
    const actualDuration = calculatorVideoCall / callRecord?.videcallPrice
    const astrologerPrice = actualDuration * chatAstroPrice || 0
    // console.log(astrologerPrice, "astrologer price")
    const commissionPrice = actualDuration * callRecord?.videocommissionPrice || 0
    // console.log(commissionPrice, "Commission Price")


    // admin price per second


     // Ensure astrologerPrice and commissionPrice are valid
  if (isNaN(astrologerPrice) || isNaN(commissionPrice)) {
    throw new Error("Invalid astrologer or commission price calculation");
  }

  

    //admin
    const adminEarnings = new AdminEarning({
      type: "VideoCall",
      astrologerId: callRecord?.astrologerId,
      customerId: callRecord?.customerId,
      transactionId: callRecord?.callId,
      totalPrice: parseFloat(calculatorVideoCall),
      adminPrice: calculatorVideoCallAdmin,
      partnerPrice: calculatorVideoCallAstrologer,
      historyId: callRecord?.callId,
      duration: durationInseconds,
      chargePerMinutePrice:perMinuteCharge,
      startTime: createdAt,
      endTime: new Date().getTime().toString(),
    });

    database.ref(`CurrentCallVideo/${callRecord?.astrologerId}`).remove()


    const totalWalletRecharge = (await RechargeWallet.find()).length;
    const totalAstrologerWallet = (await AstrologerWallet.find()).length;

    const customerInvoiceId = `#ASTROONE${totalWalletRecharge}`;
    const astrologerInvoiceId = `#ASTROONE${totalAstrologerWallet}`;

    let rechargeAmount = parseFloat(calculatorVideoCall);
    const customerWalletHistory = {
      customer: callRecord?.customerId,
      referenceId: callRecord?.callId,
      referenceModel: 'ChatHistory',
      invoiceId: customerInvoiceId,
      gst: 18,
      recieptNumber: totalWalletRecharge + 1,
      discount: "",
      offer: "",
      totalAmount: "",
      amount: rechargeAmount,
      paymentMethod: "Online",
      transactionType: 'DEBIT',
      type: 'CHAT'
    };

    // console.log(customerWalletHistory, "customerWalletHistory")

    const astrolgoerWalletHistory = {
      astrologerId: callRecord?.astrologerId,
      referenceId: callRecord?.callId.toString(),
      referenceModel: 'ChatHistory',
      invoiceId: astrologerInvoiceId,
      gst: 0,
      recieptNumber: totalAstrologerWallet + 1,
      totalAmount: 0,
      amount: astrologerPrice,
      paymentMethod: "Online",
      transactionType: 'CREDIT',
      type: 'CHAT'
    };

    // console.log(astrolgoerWalletHistory, "astrolgoerWalletHistory")

    const newCustomerWallet = new RechargeWallet(customerWalletHistory)
    const newAstrologerWallet = new AstrologerWallet(astrolgoerWalletHistory)

    const date1 = new Date(astrologer?.today_earnings?.date);
      const date2 = new Date();

      const sameDay = date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();

      if(sameDay){
        astrologer.today_earnings = {
          date: new Date(),
          earnings: astrologer.today_earnings?.earnings + calculatorVideoCallAstrologer
        }
      }else{
        astrologer.today_earnings = {
          date: new Date(),
          earnings: calculatorVideoCallAstrologer
        }
      }

    // astrologer.wallet_balance += astrologerPrice;
    (astrologer.wallet_balance || 0) + parseFloat(astrologerPrice);
    if (isNaN(astrologer.wallet_balance)) {
      throw new Error("Astrologer wallet_balance resulted in NaN");
    }
    astrologer.total_minutes += durationInMinutes;
    astrologer.wallet_balance += calculatorVideoCallAstrologer;
    astrologer.chat_status = 'online';
    astrologer.call_status = 'online';
    astrologer.video_call_status = 'online';
    customer.new_user = false;

    // Update the status of the call record
    callRecord.totalPrice = parseFloat(calculatorVideoCall);
    callRecord.status = 'completed';
    await callRecord.save();
    await customer.save();
    await adminEarnings.save();
    await astrologer.save();
    await newCustomerWallet.save()
    await newAstrologerWallet.save();

    const currentDate = new Date(createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const start_date = currentDate.split(',')[0];
    const start_time = currentDate.split(',')[1];

    const respon = {
      astrologer: {
        _id: String(callRecord?.astrologerId),
        astrologerName: String(astrologer?.astrologerName),
        gender: String(astrologer?.gender),
        profileImage: String(astrologer?.profileImage),
        chatPrice: String(VideoCallPrice),
        commissionPrice: String(VideoCallCommision),
      },
      customer: {
        customerId: String(callRecord?.customerId),
        customerName: String(customer?.customerName),
        customerImage: String(customer?.image),
        wallet_balance: String(customer?.wallet_balance),
        dateOfBirth: String(customer?.dateOfBirth),
        latitude: String(customer?.address?.latitude),
        longitude: String(customer?.address?.longitude),
        maritalStatus: String(""), // If you want it to be a string
        placeOfBirth: String(customer?.address?.birthPlace),
        status: String(customer?.status),
      },
      invoice: {
        startDate: String(start_date),
        startTime: String(start_time),
        transactionId: String(callRecord?.callId),
        totalPrice: String(parseFloat(calculatorVideoCall)), // Convert to string
        invoice_id: String(customerInvoiceId),
        duration: String(durationInseconds), // Convert to string
        redirect: String("VideoCall"),
        astrologerId:String(callRecord?.astrologerId),
        customerId: String(callRecord?.customerId),
        type: String("VideoCall"),
        astrologerName: String(astrologer?.astrologerName),
        gender: String(astrologer?.gender),
        profileImage: String(astrologer?.profileImage),
        chatPrice: String(VideoCallPrice),
        commissionPrice: String(VideoCallCommision),
      }
    };
    

    const notification = {
      title: "Video call End",
      body: "Video Call End",
     
    };

    let deviceToken = customer?.fcmToken;
    // Notification Customer
    await notificationService.sendNotification(
      deviceToken,
      notification,
      respon.invoice
    );

    
    
    // console.log(respon, "responseee");

    return res.status(200).json({ success: true, message: "Call status updated successfully!", data: respon });

  } catch (error) {
    // console.error("Error updating call statusssss:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}; 



exports.getVideoCallHistory = async (req, res)=>{
  try{

    const {customerId} = req.body;

    if(!customerId || customerId == " "){
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId'
      })
    }

    const  history = await AdminEarning.find({customerId, type:'VideoCall'}).populate('customerId', '_id customerName gender image').sort({ _id: -1 }).populate("astrologerId", "astrologerName gender email profileImage phoneNumber normal_video_call_price ");

    return res.status(200).json({
      success: true,
      message: 'Gettting data successfully',
      results: history
    })

  }

  catch(error){
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}


exports.deleteAccount = async (req, res)=>{
  try{

    const {customerId} = req.body;
    if(!customerId || customerId == " "){
      return res.status(400).json({
        success: false,
        message: 'Please provide customerId!'
      })
    }

    const customer = await Customers.findById({_id: customerId})

    if(customer){
      customer.isDeleted = 1
      await customer.save()
      return res.status(200).json({
        success: true,
        message: 'Customer Account delted successfully',
        results: customer
      })
    }

    return res.status(200).json({
      success: true,
      message: 'customer not found',
      results: customer
    })

  }

  catch(error){
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

const generateOrderId = () => {
  return 'Order_AstroOne' + Date.now();
};
exports.phonepePayment = async (req, res) => {
  try {
    const { customerId, amount } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ success: false, message: "Customer Id and Amount are Required." });
    }

    const orderId = generateOrderId();
    // const callbackUrl = 'https://api.astroremedy.com/api/customers/callbackPhonepe';
    // const redirectUrl = 'https://api.astroremedy.com/api/customers/redirectPhonepeWallet';

    // Save customer details
    const customers = new PhonepeWallet({
      customerId,
      amount,
      orderId,
      type: 'WALLET_RECHARGE'
    });

    await customers.save();
   

    // Return redirect URL to the client to handle the redirection
    return res.status(200).json({
      success: true,
      message: "Payment Gateway",
      orderId: orderId,
      amount : amount
    });

  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
}


exports.callbackPhonepe = async (req, res) => {
  const data = req.body;
  console.log('data Response :::: ',data);
  // Decode the Base64 response
  const decodedResponse = Buffer.from(data.response, 'base64').toString('utf-8');

  // Parse the decoded string to JSON
  const parsedResponse = JSON.parse(decodedResponse);

  try {
    // Check if the transaction was successful
    if (parsedResponse?.code === 'PAYMENT_SUCCESS') {
      // Extract order ID and other details
      const merchantTransactionId = parsedResponse.data?.merchantTransactionId; // Transaction ID
       // Assuming this is the correct path to customer ID in the response

      // Find the transaction in your database using the merchantTransactionId
      const phonepeWalletStatus = await PhonepeWallet.findOne({ orderId: merchantTransactionId });

      console.log("PhonePe wallet status:", phonepeWalletStatus);
      const customerId = phonepeWalletStatus?.customerId;
      if (!phonepeWalletStatus) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found.",
        });
      }

      // Fetch customer by ID
      const customer = await Customers.findById(customerId); // Use the extracted customerId

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      // Proceed with wallet recharge
      const totalWalletRecharge = (await RechargeWallet.find()).length;
      const invoiceId = `#ASTROONE${totalWalletRecharge + 1}`; // Ensure to increment correctly
      let rechargeAmount = parseFloat(phonepeWalletStatus?.amount);
      
      const history = {
        customer: customer._id,
        invoiceId: invoiceId,
        gst: 18,
        recieptNumber: totalWalletRecharge + 1,
        discount: "",
        offer: "",
        totalAmount: rechargeAmount,
        amount: rechargeAmount,
        paymentMethod: "Online",
        transactionType: 'CREDIT',
        type: 'WALLET_RECHARGE'
      };

      // Handle any first recharge offers if applicable
      const firstRechargeId = false; // Replace with actual logic if needed
      const rechargePlanId = null; // Replace with actual logic if needed
      
      if (firstRechargeId) {
        const firstRecharge = await FirstRechargeOffer.findById(firstRechargeId);
        const recharge = firstRecharge.first_recharge_plan_amount;
        const discount = firstRecharge.first_recharge_plan_extra_percent;
        rechargeAmount = recharge + (recharge * discount) / 100;
        history.totalAmount = rechargeAmount;
        history.amount = rechargeAmount;
        history.offer = discount.toString();
        customer.first_wallet_recharged = true;
      } else if (rechargePlanId) {
        const plan = await RechargePlan.findById(rechargePlanId);
        const recharge = plan.amount;
        const discount = plan.percentage;
        rechargeAmount = recharge + (recharge * discount) / 100;
        history.totalAmount = rechargeAmount;
        history.amount = rechargeAmount;
        history.offer = discount.toString();
      } else {
        history.totalAmount = rechargeAmount;
      }

      // Create a new transaction record
      const rechargeTransaction = new RechargeWallet(history);
      await rechargeTransaction.save();

      // Update wallet balance in the Customers schema
      customer.wallet_balance += rechargeAmount; // Increment the wallet balance
      await customer.save();

      const updatedCustomer = await Customers.findById(customer._id);

      res.status(200).json({
        success: true,
        message: "Wallet recharge successful.",
        updatedCustomer,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment was not successful.",
        parsedResponse,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.redirectPhonepeWallet = async (req, res) => {
  try {
    const web = `<!DOCTYPE html>
      <html>
      
      <head>
        <title>Redirecting...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
          }
        </style>
      </head>
      
      <body>
          <h1>Redirecting to Wallet...</h1>
          <p>Please wait while we redirect you.</p>
        
        <script>
          // Trigger navigation to the 'wallet' screen immediately when the page loads
          window.onload = function() {
            try {
              navigateToWallet();
            } catch (error) {
              console.error('Error navigating to wallet:', error);
            }
          };
      
          // Custom JavaScript function to navigate to the 'wallet' screen
          function navigateToWallet() {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage('navigateToWallet');
            } else {
              console.error('ReactNativeWebView not found.');
            }
          }
        </script>
      </body>
      
      </html>`;
    
    res.send(web);
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};


// RAHUL 
// src/controllers/customerController.js
exports.gif = async (req, res) => {
  try {
    const gifs = {
      NavgrahTemple: `${req.protocol}://${req.get('host')}/gifs/NavgrahTemple.gif`,
      SanatanTemple: `${req.protocol}://${req.get('host')}/gifs/SanatanTemple.gif`,
      Shivalya: `${req.protocol}://${req.get('host')}/gifs/ShivalyaTemple.gif`,
      NavgrahTemple2: `${req.protocol}://${req.get('host')}/gifs/NavgrahTemple.gif`
    };

    return res.status(200).json({
      success: true,
      message: "GIFs fetched successfully",
      gifs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.SanatanTemple = async (req, res) => {
  try {
    const gifs = {
      brahaspatidev: `${req.protocol}://${req.get('host')}/gifs/brahaspatidev.gif`,
      durgamata: `${req.protocol}://${req.get('host')}/gifs/durgamata.gif`,
      ganeshji: `${req.protocol}://${req.get('host')}/gifs/ganeshji.gif`,
      ganeshji2: `${req.protocol}://${req.get('host')}/gifs/ganeshji2.gif`,
      ganeshji3: `${req.protocol}://${req.get('host')}/gifs/ganeshji3.gif`,
      khatushyam: `${req.protocol}://${req.get('host')}/gifs/khatushyam.gif`,
      God: `${req.protocol}://${req.get('host')}/gifs/God.gif`,
      RamLaxman: `${req.protocol}://${req.get('host')}/gifs/RamLaxman.gif`,
      god1122: `${req.protocol}://${req.get('host')}/gifs/god1122.gif`,
      MAALAXMIREEL2: `${req.protocol}://${req.get('host')}/gifs/MAALAXMIREEL2.gif`
    };

    return res.status(200).json({
      success: true,
      message: "GIFs fetched successfully",
      gifs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};