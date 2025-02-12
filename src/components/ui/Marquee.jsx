import { CreditCard } from "lucide-react";
import Marquee from "react-fast-marquee";

const MarqueeComponent = () => {

    const marqueeDetails = [{
        icon: <CreditCard />,
        title: "No Cost EMI"
    },
    {
        icon: <CreditCard />,
        title: "No Cost EMI"
    },{
        icon: <CreditCard />,
        title: "No Cost EMI"
    },{
        icon: <CreditCard />,
        title: "No Cost EMI"
    },{
        icon: <CreditCard />,
        title: "No Cost EMI"
    },
    {
        icon: <CreditCard />,
        title: "No Cost EMI"
    },
    {
        icon: <CreditCard />,
        title: "No Cost EMI"
    }
]

    return (
        <>
            <main className="bg-white p-2">
                <Marquee speed={40}>
                        {
                            marqueeDetails.map((item, index) => (
                                <div key={index} className="flex items-center justify-center gap-3 text-blue-900 md:text-sm text-xs px-10">
                                    <div>{item.icon}</div>
                                    <div>{item.title}</div>
                                </div>
                            ))
                        }
                </Marquee>
            </main>
        </>
    )
}
export default MarqueeComponent;