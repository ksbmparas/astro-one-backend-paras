const mongoose = require('mongoose')
const CustomerSchema = mongoose.Schema({
    unique_id:{
        type: String
    },
    customerName: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    alternateNumber: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ' ',
        // index:true,
        // unique:true,
        // sparse: true,
    },
    image: {
        type: String,
        default: ''
    },
    address:{
        type: Object,
        default: {
            city: '',
            state: '',
            country: '',
            zipCode: '',
            birthPlace: '',
            latitude: 0,
            longitude: 0
        }
    },
    dateOfBirth: {
        type: String,
        default: ''
    },
    timeOfBirth: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    isBlock: {
        type: Number,
        default: 0
    },
    otp: {
        type: Number,
        default: ''
    },
    fcmToken: {
        type: String,
        default: ''
    },
    webFcmToken: {
        type: String,
        default: "",
    },
    isOtpVerified: {
        type: Number,
        default: 0
    },
    isSignupCompleted: {
        type: Number,
        default: 0
    },
    referral_code: { type: String, unique: true },

    referred_by: {
        type: String
    },
    referral_count: { type: Number, default: 0 },
    device_type: {
        type: Number
    },
    registration_date: {
        type: Date
    },
    login_date: {
        type: Date
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    chat_status: {
        type: Boolean,
        default: false
    },
    call_status: {
        type: Boolean,
        default: false
    },
    new_user: {
        type: Boolean,
        default: true
    },
    first_wallet_recharged: {
        type: Boolean,
        default: false
    },
    device_id:{
        type: String,
        default: '',
    },
    is_registered:{
        type: Boolean,
        default: 0
    },
    banned_status:{
        type: Boolean,
        default: false
    },
    wallet_balance: { type: Number, default: 0 }, // Set a default value
    
}, { collection: 'Customers', timestamps: true })

const Customers = mongoose.model('Customers', CustomerSchema);
// module.exports = customerModel
module.exports = Customers