import React, { useEffect, useState } from 'react';
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

// This component provides a paginated MUI table that fetches data only from the specified page.
// This optimization is known as lazy loading. It is unnecessary for you to utilize this optimization
// in your final project, but is a good example of many React features and presented as an exercise.

// Take a look at the definition of the LazyTable component. The parameters represent the properties (props)
// passed into the component. Some of these props are optional (defaultPageSize, rowsPerPageOptions) while
// others are required (routes, columns). Though not indicated by code, whether the props are optional or
// required will affect how you handle them in the code.
export default function LazyTable({ route, columns, defaultPageSize, rowsPerPageOptions }) {
  const [data, setData] = useState([]);
  const [clickedReview, setClickedReview] = useState(null);
  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  // Now notice the dependency array contains route, page, pageSize, since we
  // need to re-fetch the data if any of these values change
  useEffect(() => {
    fetch(`${route}?page=${page}&page_size=${pageSize}`)
      .then(res => res.json())
      .then(resJson => {
        // setData(Object.keys(resJson).length > 0 ? resJson : []);
        setData(resJson);
      });
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    // Can always go to previous page (TablePagination prevents negative pages)
    // but only fetch next page if we haven't reached the end (currently have full page of data)
    if (newPage < page || data.length === pageSize) {
      // Note that we set newPage + 1 since we store as 1 indexed but the default pagination gives newPage as 0 indexed
      setPage(newPage + 1);
    }
  }

  const handleChangePageSize = (e) => {
    // when handling events such as changing a selection box or typing into a text box,
    // the handler is called with parameter e (the event) and the value is e.target.value
    const newPageSize = e.target.value;
    // TODO (TASK 18): set pageSize state variable and reset the current page to 1
    setPageSize(newPageSize);
    setPage(1);
  }

  const handleReviewClick = (review) => {
    setClickedReview(review);
  }

  // const defaultRenderCell = (col, row) => {
  //   return <div>{row[col.field]}</div>;
  // }
  const defaultRenderCell = (col, row) => {
    if (col.field === 'review') {
      const firstSentence = row[col.field].split('. ')[0];
      if (clickedReview === row) {
        return (
          <TableCell>
            <Typography variant="body2">{row[col.field]}</Typography>
          </TableCell>
        );
      } else {
        return (
          <TableCell onClick={() => handleReviewClick(row)}>
            <Typography variant="body2">{row.userName}: {firstSentence}.</Typography>
          </TableCell>
        );
      }
    } else {
      return (
        <TableCell>
          <Typography variant="body2">{row[col.field]}</Typography>
        </TableCell>
      );
    }
  }

  // return (
  //   <TableContainer>
  //     <Table>
  //       <TableHead>
  //         <TableRow>
  //           {columns.map(col => <TableCell key={col.headerName}>{col.headerName}</TableCell>)}
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {data.map((row, idx) =>
  //           <TableRow key={idx}>
  //             {
  //               // TODO (TASK 19): the next 3 lines of code render only the first column. Modify this with a map statement to render all columns.
  //               // Hint: look at how we structured the map statement to render all the table headings within the <TableHead> element
  //               columns.map(col =>
  //                 <TableCell
  //                   key={col.headerName}
  //                   sx={{
  //                     width: '150px',
  //                     height: '50px',
  //                     whiteSpace: 'nowrap',
  //                     overflow: 'hidden',
  //                     textOverflow: 'ellipsis',
  //                   }}>
  //                   {col.renderCell ? col.renderCell(row) : defaultRenderCell(col, row)}
  //                 </TableCell>
  //               )
  //             }
  //           </TableRow>
  //         )}
  //       </TableBody>
  //       <TablePagination
  //         rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
  //         count={-1}
  //         rowsPerPage={pageSize}
  //         page={page - 1}
  //         onPageChange={handleChangePage}
  //         onRowsPerPageChange={handleChangePageSize}
  //       />
  //     </Table>
  //   </TableContainer>
  // )
  return (
    <TableContainer style={{ maxHeight: 600, maxWidth: "100%" }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => <TableCell key={col.headerName}>{col.headerName}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) =>
            <TableRow key={idx}>
              {columns.map(col =>
                <React.Fragment key={col.headerName}>
                  {defaultRenderCell(col, row)}
                </React.Fragment>
              )}
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
          count={-1}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangePageSize}
        />
      </Table>
    </TableContainer>
  );
}

