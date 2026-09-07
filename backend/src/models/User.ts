import mongoose, {Schema, Document} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    avatar?: string;
    googleId?: string;
    githubId?: string;
    refreshToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String},
    githubId: { type: String},
    password: { type: String},
    avatar: { type: String},
    refreshToken: { type: String}
}, {
    timestamps: true
})

const salt = 10

UserSchema.pre("save", async function(){
    if(!this.isModified("password") || !this.password){
        return 
    }
    const hash = await bcrypt.hash(this.password, salt)
    this.password = hash
})

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password)
}

UserSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
    }, process.env.JWT_SECRET_KEY as string, {
        expiresIn: "30m"
    })
}


UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    }, process.env.JWT_REFRESH_SECRET_KEY as string, {
        expiresIn: "7d"
    })
}

export const User = mongoose.model<IUser>("user", UserSchema)