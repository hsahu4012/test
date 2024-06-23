import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import { FaPaypal } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNavigate } from "react-router-dom";

const CheckoutForm = ({ price, cart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    if (typeof price !== "number" || price < 1) {
      // console.log("Price is not a number");
      // console.log(price);
      return;
    }
    axiosSecure.post("/create-payment-intent", { price }).then((res) => {
      // console.log(res.data.clientSecret);
      setClientSecret(res.data.clientSecret);
    });
  }, [price, axiosSecure]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("[error]", error);
      setCardError(error.message);
    } else {
      setCardError("success");
      // console.log("[PaymentMethod]", paymentMethod);
    }

    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: user?.displayName || "anonymous",
            email: user?.email || "unknown",
          },
        },
      });
    if (confirmError) {
      console.log(confirmError);
    }
    // console.log(paymentIntent);
    if (paymentIntent.status === "succeeded") {
      // console.log(paymentIntent.id);
      setCardError(`Your transaction Id is ${paymentIntent.id}`);

      //payment info data
      const paymentInfo = {
        email: user.email,
        transactionId: paymentIntent.id,
        price,
        quantity: cart.length,
        status: "Order pending",
        itemName: cart.map((item) => item.name),
        cartItems: cart.map((item) => item._id),
        menuItems: cart.map((item) => item.menuItemId),
      };
      // console.log(paymentInfo);

      // send information to backend
      axiosSecure.post("/payments", paymentInfo).then((res) => {
        // console.log(res.data);
        alert("Payment Successful!");
        navigate("/order");
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-start items-start gap-8">
      {/* left side  */}
      <div className="md:w-1/2 w-full text-black space-y-3">
        <h4 className="text-lg font-semibold">Order Summary</h4>
        <p>Total Price: ${price}</p>
        <p>Number of Items = {cart.length}</p>
      </div>
      {/* right side  */}
      <div className="md:w-1/2 text-black bg-white w-full space-y-3 card shrink-0 max-w-sm shadow-2xl bg-base-100 px-4 py-7">
        <h4 className="text-lg font-semibold">Process your Payment!</h4>
        <h5 className="font-medium">Credit/Debit Card</h5>

        {/* Stripe Form  */}

        <form onSubmit={handleSubmit}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
          <button
            type="submit"
            disabled={!stripe}
            className="btn btn-sm mt-5 btn-primary w-full text-white"
          >
            Pay
          </button>
          {cardError ? <p className="text-red">{cardError} </p> : ""}
        </form>

        {/* Paypal Options  */}
        <div className="mt-5 text-center">
          <hr />
          <button
            type="submit"
            // disabled={!stripe}
            className="btn btn-sm mt-5 bg-orange-500 text-white"
          >
            <FaPaypal /> Pay with PayPal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
