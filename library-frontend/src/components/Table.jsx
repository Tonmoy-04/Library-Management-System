import React from 'react';
import '../styles/table.css';

const Table = ({ columns, data, actions }) => {
  return (
    <div className="table-container" style={{
      overflowX: 'auto',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      padding: '1rem'
    }}>
      <table className="custom-table" style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--secondary-color)' }}>
            {columns.map((col, index) => (
              <th key={index} style={{
                padding: '1rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
              }}>{col}</th>
            ))}
            {actions && <th style={{
              padding: '1rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              borderBottom: '1px solid var(--secondary-color)',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {Object.values(row).map((val, cellIndex) => (
                <td key={cellIndex} style={{
                  padding: '1rem',
                  fontSize: '0.9rem'
                }}>{val}</td>
              ))}
              {actions && (
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          backgroundColor:
                            action.type === 'delete'
                              ? '#fee2e2'
                              : action.type === 'issue'
                              ? '#dcfce7'
                              : '#e0f2fe',
                          color:
                            action.type === 'delete'
                              ? '#991b1b'
                              : action.type === 'issue'
                              ? '#166534'
                              : '#075985',
                          transition: 'var(--transition)',
                          opacity: isDisabled ? 0.45 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                        title={isDisabled ? (action.disabledTitle || 'Action unavailable') : ''}
                        onMouseEnter={(e) => {
                          if (isDisabled) return;
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
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
