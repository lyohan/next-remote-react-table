import React, { useEffect } from "react";

import { SearchForm } from "../components/SearchForm";
import { Table } from "../components/Table";
import axios from "axios";
import qs from "qs";

export default function Home() {
  const columns = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
        sortable: true,
      },
      {
        Header: "Title",
        accessor: "title",
        sortable: true,
      },
      {
        Header: "User",
        accessor: "userId",
        sortable: true,
      },
      {
        Header: "Completed",
        accessor: (d) => (d.completed ? "true" : "false"),
      },
    ],
    []
  );

  const [data, setData] = React.useState([]);
  const [filters, setFilters] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [pageCount, setPageCount] = React.useState(0);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortBy, setSortBy] = React.useState({});

  const fetchData = React.useCallback(
    ({ pageSize, pageIndex }) => {
      setLoading(true);
      const params = {
        page: pageIndex + 1,
        per_page: pageSize,
      };
      const paramsArray = Object.keys(filters).reduce((acc, curr) => {
        try {
          const value = filters[curr];
          if (value !== null && value !== "") {
            acc.push(`${curr}:${value}`);
          }
        } catch (err) {}

        return acc;
      }, []);

      if (paramsArray.length > 0) {
        params.filters = paramsArray.join(",");
      }

      if (sortBy.length) {
        const { id, desc } = sortBy[0]
        params.sort = `${id}:${desc ? 'desc' : 'asc'}`;
      }

      const queryString = qs.stringify(params);
      axios
        .get(`/api/todos?${queryString}`)
        .then((res) => {
          setData(res.data.data);
          setPageCount(Math.ceil(res.data.pagination.total / pageSize));
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    },
    [filters, sortBy]
  );

  useEffect(() => {
    setPageIndex(0);
    fetchData({
      pageSize: pageSize,
      pageIndex: 0,
    });
  }, [filters, sortBy]);

  return (
    <>
      <pre>{JSON.stringify({ filters }, null, 2)}</pre>
      <pre>{JSON.stringify({ pageCount, pageSize, sortBy }, null, 2)}</pre>
      <SearchForm filters={filters} setFilters={setFilters} />
      <Table
        columns={columns}
        data={data}
        fetchData={fetchData}
        loading={loading}
        pageCount={pageCount}
        controlledPageIndex={pageIndex}
        setControlledPage={setPageIndex}
        controlledPageSize={pageSize}
        setControlledPageSize={setPageSize}
        controlledSortBy={sortBy}
        setControlledSortBy={setSortBy}
      />
      <hr />
      <div>
        <h3>Controlled PageIndex block</h3>
        <div>
          <button
            onClick={() => {
              setPageIndex(pageIndex + 1);
            }}
          >
            next page
          </button>
          <button
            onClick={() => {
              setPageSize(20);
            }}
          >
            setPageSize(20)
          </button>
          <button
            onClick={() => {
              setPageIndex(0);
              fetchData(pageSize, pageIndex);
            }}
          >
            fetchData()
          </button>
        </div>
      </div>
    </>
  );
}
