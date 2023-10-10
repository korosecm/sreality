import { useEffect, useState } from "react";
import "./App.css";

interface apartmentsData {
  id: number;
  imageurl: string;
  title: string;
}
interface paginationData {
  total_pages: number;
  current: number;
  has_next: boolean;
  has_previous: boolean;
  last_page: number;
}

function App() {
  const [page, setPage] = useState(1);
  const [apartments, setApartments] = useState([] as apartmentsData[]);
  const [pagination, setPagination] = useState({} as paginationData);
  const [loading, setLoading] = useState(false);
  const [paginationButtons, setPaginationButtons] = useState([] as any[]);

  function getApiData() {
    setLoading(true);
    fetch(`http://127.0.0.1:8080?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        setApartments(data.items);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  function rerenderButtons() {
    const tmpButtons = [];
    for (let i = 0; i < pagination.total_pages; i++) {
      tmpButtons.push(
        <button
          key={i}
          className={`mx-2 px-2 py-1 min-w-[35px]
              ${page === i + 1 ? "bg-blue" : "bg-gray-light"}
            `}
          onClick={() => setSelectedPage(i + 1)}
        >
          {i + 1}
        </button>
      );
    }
    setPaginationButtons(tmpButtons);
  }

  function setSelectedPage(pageNum: number) {
    setPage(pageNum);
  }
  useEffect(() => {
    getApiData();
  }, [page]);
  useEffect(() => {
    rerenderButtons();
  }, [pagination]);
  return (
    <div className="w-full min-h-[100vh] flex justify-center items-center bg-gray-dark py-20">
      <div>
        <div className="text-white text-2xl mb-4 font-medium">
          SREALITY APARTMENTS
        </div>

        <div className="w-[80dvw] min-h-[75dvh] bg-gray-light">
          {loading ? (
            // Loading
            <div className="w-full h-full flex justify-center items-center pt-20">
              loading
            </div>
          ) : apartments.length ? (
            // Conent
            <div className="flex flex-wrap -mx-2 p-4 px-10">
              {apartments.map((apartment) => (
                <div key={apartment.id} className="px-2 w-1/4 my-4">
                  <div className="text-xl font-medium mb-1">
                    {apartment.title}
                  </div>
                  <img
                    className="xl:min-h-[264px]"
                    src={apartment.imageurl}
                    alt=""
                  />
                </div>
              ))}
            </div>
          ) : (
            // API error
            <div className="w-full h-full flex justify-center items-center pt-20">
              Failed to fetch data
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">{paginationButtons}</div>
      </div>
    </div>
  );
}

export default App;
