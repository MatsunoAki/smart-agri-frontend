const Hero = () => {
    return (
        <div className="min-h-screen w-full">
            <div className="text-white w-full px-4 sm:px-6 lg:px-0 lg:max-w-[700px] lg:mx-[193px] mt-8 lg:mt-[100px] flex flex-col justify-center min-h-[100vh]">
                <h1 className="text-3xl lg:text-4xl font-bold text-[#f5c066]">
                    Welcome to Smart Agri-irrigation
                </h1>
                <h2 className="text-base lg:text-lg font-bold mt-2">
                    We provide the best irrigation system for your farm
                </h2>
                <div className="space-y-2 mt-10">
                    <p className="text-sm lg:text-base">
                        Our system ensures efficient water usage, reducing waste and increasing crop yield.
                    </p>
                    <p className="text-sm lg:text-base">
                        With real-time monitoring and automated controls, you can manage your irrigation from anywhere.
                    </p>
                    <p className="text-sm lg:text-base">
                        Join us in making agriculture smarter and more sustainable.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hero;