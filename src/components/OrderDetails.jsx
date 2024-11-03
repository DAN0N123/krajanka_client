import { useParams } from "react-router-dom";
import useSWR from "swr";
import fetcher from "../helpers/fetcher";
import useSwipe from "../helpers/useSwipe.jsx";
import {
  MapPin,
  Phone,
  CalendarDays,
  Clock,
  CreditCard,
  NotebookPen,
} from "lucide-react";
import { useState, useRef } from "react";
import Confirm from "./Confirm";
import { useNavigate } from "react-router-dom";
import Big from "big.js";
import EditForm from "./EditForm";
import Spinner from "./Spinner.jsx";
Big.DP = 2;
Big.RM = Big.roundHalfUp;

export default function OrderDetails() {
  const { id } = useParams();
  const { data, isLoading } = useSWR(`/orders/get/${id}`, fetcher);
  const [editing, setEditing] = useState(false);
  const [confirmWindow, setConfirmWindow] = useState(false);
  const navigate = useNavigate();
  useSwipe(
    () => goToNextOrder(),
    () => goToPrevioustOrder()
  );

  const componentRef = useRef();

  function handlePrint() {
    window.print();
  }

  async function goToNextOrder() {
    try {
      const nextID = await fetcher(`/orders/getNextOrderID/${id}`);
      navigate(`/zamówienie/${nextID}`);
    } catch (err) {
      console.log(err);
    }
  }
  async function goToPrevioustOrder() {
    try {
      const nextID = await fetcher(`/orders/getPreviousOrderID/${id}`);
      navigate(`/zamówienie/${nextID}`);
    } catch (err) {
      console.log(err);
    }
  }

  async function removeOrder() {
    try {
      await fetcher(`/orders/remove/${id}`, "POST");
      navigate("/zamówienia");
    } catch (err) {
      console.log(err);
    }
  }
  if (data && data.products.length >= 10) {
    return (
      <div className="relative w-full h-fit p-4 bg-[#fbe8a6] print:flex print:justify-center print:items-center print:p-0 print:w-[148mm] print:h-[210mm] print:scale-90">
        {confirmWindow && (
          <Confirm
            action={"Usuń zamówienie"}
            description={
              "Czy na pewno chcesz usunąć zamówienie? Ta czynność nie może być cofnięta."
            }
            cancel={() => setConfirmWindow(false)}
            confirm={() => removeOrder()}
          />
        )}
        <div
          className="bg-white w-full max-w-[130mm] print:shadow-none rounded-xl shadow-2xl flex flex-col items-start p-4 gap-6 pb-8 print:!text-xs print:gap-2 print:pb-4"
          ref={componentRef}
        >
          {isLoading ? (
            <Spinner />
          ) : editing && data ? (
            <EditForm order={data} close={() => setEditing(false)} />
          ) : data ? (
            <>
              <p className="text-2xl text-slate self-center tablet:text-3xl print:text-base print:text-left print:mb-2">
                Zamówienie numer: {data.orderNumber}
              </p>
              <div className="flex flex-col gap-3 w-full text-lg tablet:text-xl print:!text-xs">
                <div className="flex gap-2 items-center">
                  <MapPin
                    color="#f28a72"
                    width={"30px"}
                    height={"auto"}
                    className="tablet:w-[2rem] print:w-[1.5rem]"
                  />
                  <p>{data.address}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Phone
                    color="#f28a72"
                    width={"30px"}
                    height={"auto"}
                    className="tablet:w-[2rem] print:w-[1.5rem]"
                  />
                  <p>{data.phone}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <CreditCard
                    color="#f28a72"
                    width={"30px"}
                    height={"auto"}
                    className="tablet:w-[2rem] print:w-[1.5rem]"
                  />
                  <p>{data.paymentMethod || "- ~ -"}</p>
                </div>
                <div className="flex gap-2 items-center dontPrint">
                  <NotebookPen
                    color="#f28a72"
                    width={"30px"}
                    height={"auto"}
                    className="tablet:w-[2rem]"
                  />
                  <p>{data.note || "- ~ -"}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <CalendarDays
                    color="#f28a72"
                    width={"30px"}
                    height={"auto"}
                    className="tablet:w-[2rem] print:w-[1.5rem]"
                  />
                  <p>{data.date || "- ~ -"}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Clock
                    color="#f28a72"
                    width={"30px"}
                    height={"auto"}
                    className="tablet:w-[2rem] print:w-[1.5rem]"
                  />
                  <p>{data.time || "- ~ -"}</p>
                </div>
                {data.products.length > 0 && (
                  <div className="gap-2 p-1 grid grid-cols-[minmax(90px,_1.5fr)_1fr_2fr_1fr] text-left w-full print:grid-cols-4 print:gap-1 print:p-1">
                    <p>Nazwa:</p>
                    <p>Cena:</p>
                    <p>Ilość:</p>
                    <p>Razem:</p>
                  </div>
                )}
                {data.products.map(
                  ({ id, name, price, quantity, packagingMethod }) => (
                    <div
                      key={id}
                      className="relative border rounded-md p-1 gap-2 grid grid-cols-[minmax(90px,_1.5fr)_1fr_2fr_1fr] items-center text-left w-full print:grid-cols-4 print:gap-1 print:p-1 print:text-xs"
                    >
                      <p className="break-words">{name}</p>
                      <p>{price >= 1 ? `${price} zł` : `${price * 100} gr`}</p>
                      <p>
                        {quantity} ({packagingMethod})
                      </p>
                      <p>{`${String(Big(quantity).times(price))} zł`}</p>
                    </div>
                  )
                )}
                {data.products.length > 0 && (
                  <div className="gap-2 p-1 flex w-full justify-end print:gap-1 print:p-1">
                    <p className="border-2 border-slate p-1 rounded-md flex gap-2 print:text-xs print:p-1 print:gap-1">
                      <span>Suma:</span>
                      <span>
                        {String(
                          data.products
                            .reduce(
                              (acc, product) =>
                                acc.plus(
                                  Big(product.quantity).times(product.price)
                                ),
                              Big(0)
                            )
                            .toFixed(2)
                        )}{" "}
                        zł
                      </span>
                    </p>
                  </div>
                )}
                <div className="mt-4 flex gap-4 dontPrint text-lg tablet:text-xl">
                  <button
                    className="bg-slate rounded-2xl flex-grow p-3 flex justify-center items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setEditing(true);
                    }}
                  >
                    <p className="text-white">Edytuj</p>
                  </button>
                  <button
                    className="bg-[#E74D4D] rounded-2xl flex-grow p-3 flex justify-center items-center"
                    onClick={() => setConfirmWindow(true)}
                  >
                    <p className="text-white">Usuń</p>
                  </button>
                </div>
                <button
                  className="bg-slate rounded-2xl flex-grow p-3 flex justify-center items-center dontPrint"
                  onClick={handlePrint}
                >
                  <p className="text-white text-lg tablet:text-xl">Drukuj</p>
                </button>
              </div>
            </>
          ) : (
            <p>Brak danych do wyświetlenia.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-fit p-4 bg-[#fbe8a6]">
      {confirmWindow && (
        <Confirm
          action={"Usuń zamówienie"}
          description={
            "Czy na pewno chcesz usunąć zamówienie? Ta czynność nie może być cofnięta."
          }
          cancel={() => {
            setConfirmWindow(false);
          }}
          confirm={() => {
            removeOrder();
          }}
        />
      )}
      <div
        className="bg-white h-full w-full print:shadow-none rounded-xl shadow-2xl flex flex-col items-start p-4 gap-6 pb-8 print:!text-sm"
        ref={componentRef}
      >
        {isLoading ? (
          <Spinner />
        ) : editing && data ? (
          <EditForm
            order={data}
            close={() => {
              setEditing(false);
            }}
          />
        ) : data ? (
          <>
            <p className="text-2xl text-slate self-center tablet:text-3xl print:text-lg print:text-left print:mb-2">
              {" "}
              Zamówienie numer: {data.orderNumber}
            </p>
            <div className="flex flex-col gap-3 w-full text-lg tablet:text-xl print:!text-sm">
              <div className="flex gap-2 items-center">
                <MapPin
                  color="#f28a72"
                  width={"30px"}
                  height={"auto"}
                  className="tablet:w-[2rem] print:w-[1.5rem]"
                />
                <p>{data.address} </p>
              </div>
              <div className="flex gap-2 items-center">
                <Phone
                  color="#f28a72"
                  width={"30px"}
                  height={"auto"}
                  className="tablet:w-[2rem]  print:w-[1.5rem]"
                />
                <p>{data.phone} </p>
              </div>
              <div className="flex gap-2 items-center">
                <CreditCard
                  color="#f28a72"
                  width={"30px"}
                  height={"auto"}
                  className="tablet:w-[2rem]  print:w-[1.5rem]"
                />
                <p> {data.paymentMethod || "- ~ -"} </p>
              </div>
              <div className="flex gap-2 items-center dontPrint">
                <NotebookPen
                  color="#f28a72"
                  width={"30px"}
                  height={"auto"}
                  className="tablet:w-[2rem]"
                />
                <p> {data.note || "- ~ -"} </p>
              </div>
              <div className="flex gap-2 items-center">
                <CalendarDays
                  color="#f28a72"
                  width={"30px"}
                  height={"auto"}
                  className="tablet:w-[2rem]  print:w-[1.5rem]"
                />
                <p> {data.date || "- ~ -"} </p>
              </div>
              <div className="flex gap-2 items-center">
                <Clock
                  color="#f28a72"
                  width={"30px"}
                  height={"auto"}
                  className="tablet:w-[2rem]  print:w-[1.5rem]"
                />
                <p> {data.time || "- ~ -"} </p>
              </div>
              {data.products.length > 0 && (
                <div className="gap-2 p-1 grid grid-cols-[minmax(90px,_1.5fr)_1fr_2fr_1fr] text-left w-full print:grid-cols-[1fr_1fr_1fr_1fr] print:gap-1 print:p-0">
                  <p>Nazwa:</p>
                  <p>Cena:</p>
                  <p>Ilość:</p>
                  <p>Razem:</p>
                </div>
              )}

              {data.products.map(
                ({ id, name, price, quantity, packagingMethod }) => (
                  <div
                    key={id}
                    className="relative border rounded-md p-1 gap-2 grid grid-cols-[minmax(90px,_1.5fr)_1fr_2fr_1fr] items-center text-left w-full print:grid-cols-[1fr_1fr_1fr_1fr] print:!text-sm print:gap-1 print:p-1"
                  >
                    <p className="break-words">{name}</p>
                    <p>{price >= 1 ? `${price} zł` : `${price * 100} gr`}</p>
                    <p>
                      {quantity} ({packagingMethod})
                    </p>
                    <p>{`${String(Big(quantity).times(price))} zł`}</p>
                  </div>
                )
              )}

              {data.products.length > 0 && (
                <div className="gap-2 p-1 flex w-full justify-end print:gap-1 print:p-0">
                  <p className="border-2 border-slate p-1 rounded-md flex gap-2 print:text-sm print:p-1 print:gap-1">
                    <span>Suma:</span>
                    <span>
                      {String(
                        data.products
                          .reduce(
                            (acc, product) =>
                              acc.plus(
                                Big(product.quantity).times(product.price)
                              ),
                            Big(0)
                          )
                          .toFixed(2)
                      )}{" "}
                      zł
                    </span>
                  </p>
                </div>
              )}
              <div className="mt-4 flex gap-4 dontPrint text-lg tablet:text-xl">
                <button
                  className="bg-slate rounded-2xl flex-grow p-3 flex justify-center items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setEditing(true);
                  }}
                >
                  <p className="text-white">Edytuj</p>
                </button>
                <button
                  className="bg-[#E74D4D] rounded-2xl flex-grow p-3 flex justify-center items-center"
                  onClick={() => {
                    setConfirmWindow(true);
                  }}
                >
                  <p className="text-white">Usuń</p>
                </button>
              </div>
              <button
                className="bg-slate rounded-2xl flex-grow p-3 flex justify-center items-center dontPrint"
                onClick={handlePrint}
              >
                <p className="text-white text-lg tablet:text-xl">Drukuj</p>
              </button>
            </div>
          </>
        ) : (
          <p>Brak danych do wyświetlenia.</p>
        )}
      </div>
    </div>
  );
}
