import authRoutes from "./authRoutes.js";
const constructorMethod = (app) => {
    app.use("/api/auth", authRoutes);
    console.log('this should run');
    app.use("*", (req, res) => { res.send("<h1>Welcome Home</h1>"); });
};
export default constructorMethod;
//# sourceMappingURL=index.js.map