import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define interfaces for the API response
interface VinDecodeResult {
  Variable: string;
  Value: string | null;
  ValueId: string | null;
}

interface VinDecodeResponse {
  Results: VinDecodeResult[];
  Message: string;
  SearchCriteria: string;
}

interface VehicleSpecs {
  Make: string | null;
  Model: string | null;
  ModelYear: string | null;
  BodyClass: string | null;
  EngineModel: string | null;
  FuelTypePrimary: string | null;
  PlantCity: string | null;
  PlantCountry: string | null;
  PlantState: string | null;
  Series: string | null;
  Trim: string | null;
  VehicleType: string | null;
  Doors: string | null;
  DriverType: string | null;
  TransmissionStyle: string | null;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'VIN Checker';
  vin: string = 'JHMCM56377C011150'; // Default VIN for testing
  vehicleData: VinDecodeResponse | null = null;
  vehicleSpecs: VehicleSpecs | null = null;
  loading: boolean = false;
  error: string = '';
  activeTab: string = 'basic';

  constructor(private http: HttpClient) {}

  checkVin() {
    if (!this.vin || this.vin.length !== 17) {
      this.error = 'Please enter a valid 17-character VIN';
      return;
    }

    this.loading = true;
    this.error = '';
    this.activeTab = 'basic';
    this.vehicleSpecs = null;
    
    this.http.get<VinDecodeResponse>(`http://localhost:8081/api/vin/check/${this.vin}`)
      .subscribe({
        next: (data: VinDecodeResponse) => {
          this.vehicleData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error fetching vehicle data. Please try again.';
          this.loading = false;
          console.error(err);
        }
      });
  }

  getVehicleSpecs() {
    if (!this.vin || this.vin.length !== 17) return;
    
    this.loading = true;
    this.activeTab = 'specs';
    
    this.http.get<any>(`http://localhost:8081/api/vin/specs/${this.vin}`)
      .subscribe({
        next: (data: any) => {
          if (data.Results && data.Results.length > 0) {
            this.vehicleSpecs = data.Results[0];
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error fetching vehicle specifications';
          this.loading = false;
          console.error(err);
        }
      });
  }

  // Helper function to get specific vehicle detail
  getVehicleDetail(variable: string): string {
    if (!this.vehicleData) return 'N/A';
    
    const result = this.vehicleData.Results.find(item => 
      item.Variable === variable || item.Variable?.includes(variable)
    );
    
    return result?.Value || 'N/A';
  }
}