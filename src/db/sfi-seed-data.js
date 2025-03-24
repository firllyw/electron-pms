/**
 * SFI component data for a cargo ship
 * This data follows the SFI Group System hierarchical structure
 */
const cargoShipComponentData = {
  // Ship General - SFI: 1
  "shipGeneral": {
    id: "shipGeneral",
    name: "Ship General",
    sfi_code: "1",
    type: "system",
    children: [
      {
        name: "General Ship Design",
        sfi_code: "10",
        type: "system",
        children: [
          { name: "Design Drawings", sfi_code: "100", type: "document" },
          { name: "Stability Documentation", sfi_code: "101", type: "document" }
        ]
      },
      {
        name: "Tests & Trials",
        sfi_code: "11",
        type: "system",
        children: [
          { name: "Sea Trial Documentation", sfi_code: "110", type: "document" },
          { name: "Test Reports", sfi_code: "111", type: "document" }
        ]
      }
    ]
  },
  
  // Hull - SFI: 2
  "hull": {
    id: "hull",
    name: "Hull",
    sfi_code: "2",
    type: "system",
    children: [
      {
        name: "Hull Structure",
        sfi_code: "20",
        type: "system",
        children: [
          { name: "Hull Shell Plating", sfi_code: "200", type: "component" },
          { name: "Hull Framing", sfi_code: "201", type: "component" },
          { name: "Bulkheads", sfi_code: "202", type: "component" }
        ]
      },
      {
        name: "Hull Outfitting",
        sfi_code: "21",
        type: "system",
        children: [
          { name: "Hatches", sfi_code: "210", type: "component" },
          { name: "Access Doors", sfi_code: "211", type: "component" },
          { name: "Manholes", sfi_code: "212", type: "component" }
        ]
      }
    ]
  },
  
  // Equipment for Cargo - SFI: 3
  "cargoEquipment": {
    id: "cargoEquipment",
    name: "Equipment for Cargo",
    sfi_code: "3",
    type: "system",
    children: [
      {
        name: "Cargo Handling Systems",
        sfi_code: "30",
        type: "system",
        children: [
          {
            name: "Cargo Cranes",
            sfi_code: "300",
            type: "component",
            manufacturer: "Marine Cranes Ltd",
            model: "CL-5000",
            technical_specs: "5T max capacity",
            children: [
              { name: "Crane Hydraulic System", sfi_code: "3001", type: "component" },
              { name: "Crane Control System", sfi_code: "3002", type: "component" },
              { name: "Crane Wire Ropes", sfi_code: "3003", type: "component" }
            ]
          },
          {
            name: "Cargo Winches",
            sfi_code: "301",
            type: "component",
            manufacturer: "Winch Systems Corp",
            model: "CW-2000",
            running_hours: 3240
          }
        ]
      },
      {
        name: "Cargo Holds",
        sfi_code: "31",
        type: "system",
        children: [
          { name: "Hold #1", sfi_code: "310", type: "space" },
          { name: "Hold #2", sfi_code: "311", type: "space" },
          { name: "Hold #3", sfi_code: "312", type: "space" }
        ]
      },
      {
        name: "Cargo Refrigeration",
        sfi_code: "32",
        type: "system",
        children: [
          {
            name: "Reefer Control System",
            sfi_code: "320",
            type: "component",
            manufacturer: "CoolTech Marine",
            model: "RC-500"
          },
          {
            name: "Refrigeration Compressors",
            sfi_code: "321",
            type: "component",
            manufacturer: "CoolTech Marine",
            model: "CP-100",
            running_hours: 4100,
            children: [
              { name: "Compressor #1", sfi_code: "3211", type: "component", running_hours: 4200 },
              { name: "Compressor #2", sfi_code: "3212", type: "component", running_hours: 4050 }
            ]
          }
        ]
      }
    ]
  },
  
  // Ship Equipment - SFI: 4
  "shipEquipment": {
    id: "shipEquipment",
    name: "Ship Equipment",
    sfi_code: "4",
    type: "system",
    children: [
      {
        name: "Manoeuvring Equipment",
        sfi_code: "40",
        type: "system",
        children: [
          {
            name: "Rudder System",
            sfi_code: "400",
            type: "component",
            manufacturer: "Marine Steering Ltd",
            running_hours: 4500
          },
          {
            name: "Bow Thruster",
            sfi_code: "401",
            type: "component",
            manufacturer: "Thruster Tech",
            model: "BT-250",
            technical_specs: "250kW, 1500rpm",
            running_hours: 2200
          }
        ]
      },
      {
        name: "Navigation Equipment",
        sfi_code: "41",
        type: "system",
        children: [
          { name: "Radar System", sfi_code: "410", type: "component" },
          { name: "GPS System", sfi_code: "411", type: "component" },
          { name: "ECDIS", sfi_code: "412", type: "component" }
        ]
      }
    ]
  },
  
  // Machinery Main Components - SFI: 6
  "machinery": {
    id: "machinery",
    name: "Machinery Main Components",
    sfi_code: "6",
    type: "system",
    children: [
      {
        name: "Main Engine",
        sfi_code: "60",
        type: "system",
        children: [
          {
            name: "Main Diesel Engine",
            sfi_code: "600",
            type: "component",
            manufacturer: "Marine Power Inc",
            model: "ME-2000",
            serial_number: "ME2000-12345",
            installation_date: "2022-05-15",
            warranty_expiry: "2025-05-15",
            running_hours: 4382,
            criticality: "high",
            technical_specs: JSON.stringify({
              power: "1600 kW",
              rpm: "1800 rpm",
              weight: "12000 kg",
              dimensions: "3.2m x 2.1m x 2.4m"
            }),
            children: [
              {
                name: "Crankshaft Assembly",
                sfi_code: "6001",
                type: "component",
                criticality: "high",
                children: [
                  { name: "Main Bearings", sfi_code: "60011", type: "component" },
                  { name: "Connecting Rods", sfi_code: "60012", type: "component" }
                ]
              },
              {
                name: "Cylinder Head Assembly",
                sfi_code: "6002",
                type: "component",
                criticality: "high",
                children: [
                  { name: "Intake Valves", sfi_code: "60021", type: "component" },
                  { name: "Exhaust Valves", sfi_code: "60022", type: "component" },
                  { name: "Valve Springs", sfi_code: "60023", type: "component" }
                ]
              },
              {
                name: "Fuel Injection System",
                sfi_code: "6003",
                type: "component",
                criticality: "high",
                children: [
                  { name: "Fuel Pumps", sfi_code: "60031", type: "component" },
                  { name: "Fuel Injectors", sfi_code: "60032", type: "component" },
                  { name: "Fuel Lines", sfi_code: "60033", type: "component" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Gearbox",
        sfi_code: "62",
        type: "system",
        children: [
          {
            name: "Main Reduction Gear",
            sfi_code: "620",
            type: "component",
            manufacturer: "Marine Transmission Ltd",
            model: "MRG-500",
            running_hours: 4382,
            criticality: "high"
          }
        ]
      },
      {
        name: "Propeller System",
        sfi_code: "63",
        type: "system",
        children: [
          {
            name: "Propeller Shaft",
            sfi_code: "630",
            type: "component",
            manufacturer: "Marine Propulsion Inc",
            criticality: "high"
          },
          {
            name: "Propeller",
            sfi_code: "631",
            type: "component",
            manufacturer: "Marine Propulsion Inc",
            model: "PP-4B",
            technical_specs: "4-blade, 2.5m diameter",
            criticality: "high"
          },
          {
            name: "Shaft Seals",
            sfi_code: "632",
            type: "component",
            criticality: "high"
          }
        ]
      }
    ]
  },
  
  // Systems for Machinery - SFI: 7
  "machinerySystems": {
    id: "machinerySystems",
    name: "Systems for Machinery Main Components",
    sfi_code: "7",
    type: "system",
    children: [
      {
        name: "Fuel Oil System",
        sfi_code: "70",
        type: "system",
        children: [
          {
            name: "Fuel Tanks",
            sfi_code: "700",
            type: "component"
          },
          {
            name: "Fuel Treatment System",
            sfi_code: "701",
            type: "component",
            children: [
              { name: "Fuel Purifier", sfi_code: "7011", type: "component", running_hours: 3500 },
              { name: "Fuel Filters", sfi_code: "7012", type: "component" }
            ]
          },
          {
            name: "Fuel Transfer Pumps",
            sfi_code: "702",
            type: "component",
            manufacturer: "Pump Systems Inc",
            model: "FTP-100",
            running_hours: 3200
          }
        ]
      },
      {
        name: "Lube Oil System",
        sfi_code: "71",
        type: "system",
        children: [
          {
            name: "Lube Oil Tanks",
            sfi_code: "710",
            type: "component"
          },
          {
            name: "Lube Oil Purifier",
            sfi_code: "711",
            type: "component",
            manufacturer: "Marine Separator Ltd",
            model: "LOP-200",
            running_hours: 3800
          },
          {
            name: "Lube Oil Cooler",
            sfi_code: "712",
            type: "component"
          }
        ]
      },
      {
        name: "Cooling System",
        sfi_code: "72",
        type: "system",
        children: [
          {
            name: "Sea Water Cooling",
            sfi_code: "720",
            type: "component",
            children: [
              { name: "Sea Water Pumps", sfi_code: "7201", type: "component", running_hours: 4100 },
              { name: "Heat Exchangers", sfi_code: "7202", type: "component" }
            ]
          },
          {
            name: "Fresh Water Cooling",
            sfi_code: "721",
            type: "component",
            children: [
              { name: "Fresh Water Pumps", sfi_code: "7211", type: "component", running_hours: 4150 },
              { name: "Expansion Tank", sfi_code: "7212", type: "component" }
            ]
          }
        ]
      }
    ]
  },
  
  // Ship Common Systems - SFI: 8
  "commonSystems": {
    id: "commonSystems",
    name: "Ship Common Systems",
    sfi_code: "8",
    type: "system",
    children: [
      {
        name: "Ballast & Bilge System",
        sfi_code: "80",
        type: "system",
        children: [
          {
            name: "Ballast System",
            sfi_code: "800",
            type: "component",
            children: [
              { name: "Ballast Pumps", sfi_code: "8001", type: "component", running_hours: 2500 },
              { name: "Ballast Valves", sfi_code: "8002", type: "component" }
            ]
          },
          {
            name: "Bilge System",
            sfi_code: "801",
            type: "component",
            children: [
              { name: "Bilge Pumps", sfi_code: "8011", type: "component", running_hours: 1800 },
              { name: "Bilge Separators", sfi_code: "8012", type: "component", running_hours: 1500 }
            ]
          }
        ]
      },
      {
        name: "Fire & Deck Wash System",
        sfi_code: "81",
        type: "system",
        children: [
          {
            name: "Fire Fighting System",
            sfi_code: "810",
            type: "component",
            criticality: "high",
            children: [
              { name: "Fire Pumps", sfi_code: "8101", type: "component", criticality: "high" },
              { name: "Fire Mains", sfi_code: "8102", type: "component", criticality: "high" },
              { name: "Fire Extinguishers", sfi_code: "8103", type: "component", criticality: "high" }
            ]
          },
          {
            name: "Deck Wash System",
            sfi_code: "811",
            type: "component",
            children: [
              { name: "Deck Wash Pumps", sfi_code: "8111", type: "component" }
            ]
          }
        ]
      }
    ]
  }
};

module.exports = cargoShipComponentData;