export const vehicleViewState = {
    context: {
        idVehicle: null
    },
    vehicle: null
};

export const resetVehicleViewState = () => {
    vehicleViewState.context = {
        idVehicle: null
    };
    vehicleViewState.vehicle = null;
};
