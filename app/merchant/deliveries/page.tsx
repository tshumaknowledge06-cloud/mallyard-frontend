"use client";

import { useEffect,useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function MerchantDeliveries(){

  const [items,setItems] = useState<any[]>([]);

  useEffect(()=>{
    load();
  },[]);

  async function load(){

    const data =
      await fetchWithAuth("/delivery-requests/seller");

    setItems(data);
  }

  return(

    <div>

      <h1 className="text-2xl font-semibold mb-6">
        Delivery Requests
      </h1>

      {items.map((d)=>(

        <div
          key={d.id}
          className="bg-white p-6 rounded shadow mb-4"
        >

          <p>Order: {d.order_id}</p>

          <p>Status: {d.status}</p>

          <p>
            Pickup: {d.pickup_address}
          </p>

          <p>
            Dropoff: {d.dropoff_address}
          </p>

        </div>

      ))}

    </div>
  );
}