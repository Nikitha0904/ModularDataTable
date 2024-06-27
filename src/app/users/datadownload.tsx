// components/DataDownload.tsx
'use client'
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Parser } from 'json2csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export type User = {
  id: string;
  name: string;
  status: string;
  email: string;
  amount: number;
  datecreated: string;
}

interface DataDownloadProps {
  data: User[];
}

const DataDownload: FC<DataDownloadProps> = ({ data }) => {
  const handleDownloadCSV = () => {
    const parser = new Parser();
    const csv = parser.parse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = ["ID", "Name", "Status", "Email", "Amount", "Date Created"];
    const tableRows: any[] = [];

    data.forEach(row => {
      const rowData = [
        row.id,
        row.name,
        row.status,
        row.email,
        row.amount.toString(),
        row.datecreated,
      ];
      tableRows.push(rowData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 10,
      theme: 'striped',
    });

    doc.save('data.pdf');
  };

  return (
    <div>
      <Button onClick={handleDownloadCSV}>Download CSV</Button>
      <Button onClick={handleDownloadPDF}>Download PDF</Button>
    </div>
  );
};

export default DataDownload;