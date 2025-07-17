import { mockInventories } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Inventory Data</h1>
        <p className="text-gray-600">
          
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockInventories.map((inventory) => (
          <Card key={inventory.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>{inventory.name}</span>
                </CardTitle>
                
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">

              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Description</span>
                
              </div>
              

              
              <div className="flex gap-2">

                <Button className="flex-1" asChild>
                  <Link href={`/products/inventory/${inventory.id}`}>
                    <Package className="h-4 w-4 mr-2" />
                    View Products
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}