export interface IDataset {
  data: number[]
  backgroundColor: string[]
  borderColor: string[]
  borderWidth: number
}
export interface ChartDataModel {
  labels: string[]
  datasets: IDataset[]
}