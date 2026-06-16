'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Phone,
  Users,
  ChevronDown,
  ChevronRight,
  TreePine,
} from 'lucide-react';
import { toast } from 'sonner';

interface StationData {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  sousDistrict: {
    name: string;
    code: string;
    district: {
      name: string;
      code: string;
      province: {
        name: string;
        code: string;
      };
    };
  };
  officerCount: number;
}

export function StationsSection() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/stations')
      .then((r) => r.json())
      .then((data) => {
        setStations(data);
        // Auto-expand first province and district
        if (data.length > 0) {
          const firstProvince = data[0].sousDistrict.district.province.name;
          const firstDistrict = data[0].sousDistrict.district.name;
          setExpandedProvinces(new Set([firstProvince]));
          setExpandedDistricts(new Set([firstDistrict]));
        }
      })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  const toggleProvince = (name: string) => {
    setExpandedProvinces((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleDistrict = (name: string) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Group stations by province > district > sous-district
  const hierarchy = stations.reduce((acc, station) => {
    const province = station.sousDistrict.district.province.name;
    const district = station.sousDistrict.district.name;
    const sousDistrict = station.sousDistrict.name;

    if (!acc[province]) acc[province] = {};
    if (!acc[province][district]) acc[province][district] = {};
    if (!acc[province][district][sousDistrict]) acc[province][district][sousDistrict] = [];
    acc[province][district][sousDistrict].push(station);
    return acc;
  }, {} as Record<string, Record<string, Record<string, StationData[]>>>);

  const totalOfficers = stations.reduce((sum, s) => sum + s.officerCount, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(hierarchy).length}</p>
              <p className="text-xs text-muted-foreground">Provinces</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stations.length}</p>
              <p className="text-xs text-muted-foreground">Commissariats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalOfficers}</p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchy Tree */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            Hiérarchie Territoriale
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          <div className="space-y-1">
            {Object.entries(hierarchy).map(([province, districts]) => (
              <div key={province} className="border rounded-lg overflow-hidden">
                {/* Province */}
                <button
                  className="w-full flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
                  onClick={() => toggleProvince(province)}
                >
                  {expandedProvinces.has(province) ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-primary" />
                  )}
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">{province}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {Object.values(districts).reduce((sum, sd) => sum + Object.values(sd).reduce((s, st) => s + st.length, 0), 0)} commissariat(s)
                  </Badge>
                </button>

                {/* Districts */}
                {expandedProvinces.has(province) && (
                  <div className="ml-6 space-y-1">
                    {Object.entries(districts).map(([district, sousDistricts]) => (
                      <div key={district} className="border-l-2 border-primary/20">
                        <button
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                          onClick={() => toggleDistrict(district)}
                        >
                          {expandedDistricts.has(district) ? (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          )}
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">{district}</span>
                          <Badge variant="secondary" className="text-[10px] ml-auto">
                            {Object.values(sousDistricts).reduce((s, st) => s + st.length, 0)} commissariat(s)
                          </Badge>
                        </button>

                        {/* Sous-Districts & Commissariats */}
                        {expandedDistricts.has(district) && (
                          <div className="ml-8 space-y-2 pb-2">
                            {Object.entries(sousDistricts).map(([sousDistrict, coms]) => (
                              <div key={sousDistrict}>
                                <p className="text-xs font-medium text-muted-foreground px-3 py-1">
                                  {sousDistrict}
                                </p>
                                {coms.map((com) => (
                                  <div
                                    key={com.id}
                                    className="flex items-center gap-3 p-3 mx-2 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                                  >
                                    <div className="p-2 rounded-lg bg-muted">
                                      <Building2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium">{com.name}</p>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                        {com.address && (
                                          <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {com.address}
                                          </span>
                                        )}
                                        {com.phone && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {com.phone}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {com.officerCount} agent(s)
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Station List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Liste des Commissariats</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {stations.map((station) => (
              <div
                key={station.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{station.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {station.sousDistrict.name} → {station.sousDistrict.district.name} → {station.sousDistrict.district.province.name}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {station.officerCount}
                  </Badge>
                  {station.phone && (
                    <p className="text-xs text-muted-foreground mt-1">{station.phone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
