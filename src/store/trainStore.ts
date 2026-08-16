import { create } from 'zustand'

export interface TrainState {
  speed: number // m/s
  distance: number // m travelled
  throttle: number // 0..1
  brake: number // 0..1
  reverser: number // -1 | 0 | 1
  horn: boolean
  awsAcknowledged: boolean
  awsAlarm: boolean
  emergencyBrake: boolean
  speedLimit: number // m/s
  signalDistance: number // m ahead
  signalRed: boolean
  startStation: string
  endStation: string
  routeDistance: number // m
  finished: boolean
  score: number
  alarmTimer: number

  setControl: (name: keyof TrainState, value: number | boolean) => void
  reset: () => void
  toggleHorn: () => void
  acknowledgeAws: () => void
}

const initial: Omit<TrainState, 'setControl' | 'reset' | 'toggleHorn' | 'acknowledgeAws'> = {
  speed: 0,
  distance: 0,
  throttle: 0,
  brake: 1,
  reverser: 1,
  horn: false,
  awsAcknowledged: false,
  awsAlarm: false,
  emergencyBrake: false,
  speedLimit: 22.22, // 80 km/h (Regionova max)
  signalDistance: 2000,
  signalRed: true,
  startStation: 'Central',
  endStation: 'Riverside',
  routeDistance: 2000,
  finished: false,
  score: 0,
  alarmTimer: 0,
}

export const useTrainStore = create<TrainState>((set, get) => ({
  ...initial,
  setControl: (name, value) => set({ [name]: value } as Partial<TrainState>),
  reset: () => set({ ...initial, score: get().score }),
  toggleHorn: () => set({ horn: !get().horn }),
  acknowledgeAws: () => set({ awsAcknowledged: true, awsAlarm: false, alarmTimer: 0 }),
}))
