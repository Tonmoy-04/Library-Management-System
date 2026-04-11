import React from 'react';
import '../styles/table.css';

const Table = ({ columns, data, actions }) => {
  const actionColumnIndex = columns.findIndex((column) => column.toLowerCase() === 'actions');

  const getActionClassName = (type) => {
    if (type === 'delete') return 'table-action-delete';
    if (type === 'issue') return 'table-action-issue';
    return 'table-action-default';
  };

  return (
    <div className="table-container modern-table-container">
      <table className="custom-table modern-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={index === actionColumnIndex ? 'cell-center' : ''}>{col}</th>
            ))}
            {actions && <th className="cell-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((val, cellIndex) => (
                <td key={cellIndex} className={cellIndex === actionColumnIndex ? 'cell-center' : ''}>{val}</td>
              ))}
              {actions && (
                <td className="cell-center">
                  <div className="table-actions">
                    {actions.map((action, actionIndex) => (
                      (() => {
                        const isDisabled = typeof action.isDisabled === 'function'
                          ? action.isDisabled(row, rowIndex)
                          : false;

                        return (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(row, rowIndex)}
                        disabled={isDisabled}
                        className={`table-action-btn ${getActionClassName(action.type)} ${isDisabled ? 'is-disabled' : ''}`}
                        title={isDisabled ? (action.disabledTitle || 'Action unavailable') : ''}
                      >
                        {action.label}
                      </button>
                        );
                      })()
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
