"use client";
import { VehicleData } from '@/types/vehicle';
import { getevents, getVehicleDataByClientId } from '@/utils/API_CALLS';
import { socket } from '@/utils/socket';
import uniqueDataByIMEIAndLatestTimestamp from '@/utils/uniqueDataByIMEIAndLatestTimestamp';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label, Pie, PieChart, LineChart, Line, Cell, CartesianGrid } from 'recharts';
export default function Dashboard({piedata,linedata,bardata}:any) {
    let { data: session } = useSession();
    if (!session) {
        session = JSON.parse(localStorage?.getItem("user"));
    }
const COLORS = ["#8884d8", "#82ca9d", "#74c0fc", "#688ae8", "#c33d69", "#2ea597"];
   
const [activeIndex, setActiveIndex] = useState(null);

const handleMouseEnter = (index) => {
    setActiveIndex(index);
};

const handleMouseLeave = () => {
    setActiveIndex(null);
};
    return (
        <>
        <div className="rounded-md    p-4"> 
            <div >
               {/*  <p className="bg-green px-4 py-1   text-center text-2xl text-white font-bold font-popins drivers_text">
                    Dashboard
                </p> */}
                <div className="grid xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12 bg-white ">

                    <div className="xl:col-span-4 lg:col-span-4 md:col-span-4 border rounded-md sm:col-span-4 p-2 pb-4">
                        <div  >
                            <h3>
                                <b>
                                    Distance Covered ({session?.unit}s)
                                </b>
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={piedata}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="distance"
                                    // label
                                    >
                                        {piedata.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                    formatter={(value, name, entry) => `${value} ${session?.unit}s`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
<div className="xl:col-span-8 bg-[#f3f4f6]">

<div className="grid xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12 pl-4 bg-white gap-4">
                    <div className="xl:col-span-6  lg:col-span-4 md:col-span-4  sm:col-span-4 border border-graylight rounded-md p-2 pb-4">
                        <div className='linedata mb-4'>
                            <h2>
                                <b>
                                    Vehicle Events
                                </b>
                            </h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                width={500}
                                height={300}
                                data={linedata}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                barGap={1} // Control gap between individual bars
                                barCategoryGap="1%"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    tick={false}
                                    dataKey="name"
                                >
                                    <Label value="Vehicle Registration Number"
                                        position={{ x: 325, y: 30 }}
                                    />
                                </XAxis>
                                <YAxis />
                                <Tooltip 
                                 cursor={{
                                    fill: 'transparent'                                   
                                }}                             
                                />
                            <Legend 
                                wrapperStyle={{                                    
                                    fontSize:"12px",
                                    marginLeft:"-18%"
                                }}                                
                                margin={{ top: 20, right: 0, left: 20, bottom: 0 }} 
                                layout="vertical" // Makes the legend vertical
                                 
                                //  align="left" // Aligns the legend to the right
                                 verticalAlign="bottom"
                                />
                                <Bar stackId="monotone" dataKey="Harsh Acceleration" fill="#688ae8" barSize={20} >
                                
                                
                                {linedata.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill="#688ae8"
                            z-index={1}
                            transform={
                                index === activeIndex
                                    ? "scale(1.01)" // Increase the size when hovered
                                    : "scale(1)"
                            }
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                                </Bar>
                                <Bar stackId="monotone" dataKey="Harsh Break" fill="#c33d69" barSize={20} > {linedata.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill="#c33d69"
                            z-index={1}
                            transform={
                                index === activeIndex
                                    ? "scale(1.01)" // Increase the size when hovered
                                    : "scale(1)"
                            }
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                                </Bar>
                                <Bar stackId="monotone" dataKey="Harsh Cornering" fill="#2ea597" barSize={20} > {linedata.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill="#2ea597"
                            z-index={1}
                            transform={
                                index === activeIndex
                                    ? "scale(1.01)" // Increase the size when hovered
                                    : "scale(1)"
                            }
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="xl:col-span-6 lg:col-span-3 md:col-span-3  sm:col-span-3 border border-graylight rounded-md p-2 pb-4">
                        <div className='linedata mb-4'>
                            <h2>
                                <b>
                                    Vehicle Trips
                                </b>
                            </h2>
                        </div>
                        <ResponsiveContainer width="90%" height={300}>
                            <BarChart data={bardata} barSize={20}
                            >
                                <Tooltip cursor={{
                                    fill: 'transparent'                                   
                                }} />
                                <XAxis
                                    dataKey="name"
                                    tick={false}
                                >
                                    <Label value="Vehicle Registration Number"
                                        position={{ x: 240, y: 30 }}
                                    />
                                </XAxis>
                                <YAxis />
                                <Bar dataKey="tripcount" fill="#8884d8" >
                                {bardata.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill="#8884d8"
                            z-index={ 1}
                            transform={
                                index === activeIndex
                                    ? "scale(1.01)" // Increase the size when hovered
                                    : "scale(1)"
                            }
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                   {/*  <div className="xl:col-span-5 lg:col-span-5 md:col-span-5  sm:col-span-5 ">
                    </div> */}
                </div>
</div>



                </div>
               {/*  <div className="grid xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12 p-4 bg-bgLight ">
                    <div className="xl:col-span-4 lg:col-span-4 md:col-span-4  sm:col-span-4 border border-graylight rounded-md p-2 pb-4">
                        <div className='linedata mb-4'>
                            <h2>
                                <b>
                                    Vehicle Events
                                </b>
                            </h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                width={500}
                                height={300}
                                data={linedata}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                barGap={1} // Control gap between individual bars
                                barCategoryGap="1%"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    tick={false}
                                    dataKey="name"
                                >
                                    <Label value="Vehicle Registration Number"
                                        position={{ x: 325, y: 30 }}
                                    />
                                </XAxis>
                                <YAxis />
                                <Tooltip />
                                <Legend margin={{ top: 20, right: 0, left: 20, bottom: 0 }} />
                                <Bar stackId="monotone" dataKey="Harsh Acceleration" fill="#688ae8" barSize={20} />
                                <Bar stackId="monotone" dataKey="Harsh Break" fill="#c33d69" barSize={20} />
                                <Bar stackId="monotone" dataKey="Harsh Cornering" fill="#2ea597" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="xl:col-span-3 lg:col-span-3 md:col-span-3  sm:col-span-3 border border-graylight rounded-md p-2 pb-4">
                        <div className='linedata mb-4'>
                            <h2>
                                <b>
                                    Vehicle Trips
                                </b>
                            </h2>
                        </div>
                        <ResponsiveContainer width="90%" height={300}>
                            <BarChart data={bardata} barSize={20}
                            >
                                <Tooltip />
                                <XAxis
                                    dataKey="name"
                                    tick={false}
                                >
                                    <Label value="Vehicle Registration Number"
                                        position={{ x: 240, y: 30 }}
                                    />
                                </XAxis>
                                <YAxis />
                                <Bar dataKey="tripcount" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="xl:col-span-5 lg:col-span-5 md:col-span-5  sm:col-span-5 ">
                    </div>
                </div> */}
            </div>
            </div>
        </>
    )
}