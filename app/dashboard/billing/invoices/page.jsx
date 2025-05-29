"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/axios"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchInvoices()
  }, [currentPage])

  const fetchInvoices = async () => {
    try {
      const response = await api.get(`/billings/invoices/?page=${currentPage}`)
      if (response.data.success) {
        setInvoices(response.data.data)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      toast.error("Failed to fetch invoices")
      console.warn("Billing API not available, using mock data")
      setPagination({ total_pages: 1, current_page: 1 })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">View and download your billing history</p>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Billing End Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice_id}>
                      <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                      <TableCell>{new Date(invoice.issued_at).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.billing_end_date).toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No invoices found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Your billing history will appear here</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && (pagination.previous || pagination.next) && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.previous}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.next}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
