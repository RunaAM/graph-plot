let LOW = 0
let HIGH = 1
let STEP = 0.01
let REPAUS = 2
let MAX_VALUE = 1023
let TOP_ROW = 0
let BOTTOM_ROW = 1
let HALF_OF_MAX_VALUE = MAX_VALUE / 2
let THIRD_OF_MAX_VALUE = MAX_VALUE / 3
let CONST_FOR_GETTING_FIVE_NUMBERS = 200
let NO_TIME = -1
let FREQUENCES = [Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI, 2 * Math.PI]
let LCD_ADDRESS = 39
let NUMBER_PINS = 9
let PHASES = [Math.PI / 6, Math.PI / 3, 2 * Math.PI / 3, Math.PI / 2, Math.PI, 3 * Math.PI / 2]
//  array of where are the leds connected
let OUTPUTS = [DigitalPin.P2, DigitalPin.P3, DigitalPin.P4, DigitalPin.P6, DigitalPin.P7, DigitalPin.P8, DigitalPin.P9, DigitalPin.P10, DigitalPin.P12]
//  initialise the lcd screen and repurpose the GPIO pins for external use
function init_device() {
    led.enable(false)
    pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
    I2C_LCD1602.LcdInit(LCD_ADDRESS)
    I2C_LCD1602.on()
    datalogger.setColumnTitles("timp", "y")
}

//  shows text on the lcd screen for a certain period of time
function render_text(val: string, row: number, time: number) {
    I2C_LCD1602.ShowString(val, 0, row)
    if (time != NO_TIME) {
        pause(time)
        I2C_LCD1602.clear()
    }
    
}

//  set value HIGH or LOW to a pin (sets the led state to on or off)
function draw_pin(pin: number, value: number) {
    pins.digitalWritePin(OUTPUTS[pin], value)
}

//  a simple function for getting the correct pin number
function calculate_pin_id(val: number): number {
    return NUMBER_PINS - (val + (NUMBER_PINS + 1) / 2)
}

function set_value(text: string): number {
    let choice: number;
    pause(1000)
    let is_value = false
    let value = 0
    I2C_LCD1602.clear()
    while (!is_value) {
        choice = pins.analogReadPin(AnalogPin.P0)
        value = Math.trunc(choice / CONST_FOR_GETTING_FIVE_NUMBERS)
        render_text(text + value, TOP_ROW, NO_TIME)
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_value = true
        }
        
    }
    return value
}

function set_from_range(text: string, range: string): number {
    let choice: number;
    pause(1000)
    let is_value = false
    let value = 0
    I2C_LCD1602.clear()
    while (!is_value) {
        choice = pins.analogReadPin(AnalogPin.P0)
        if (range == "FREQUENCE") {
            value = FREQUENCES[Math.trunc(choice / CONST_FOR_GETTING_FIVE_NUMBERS)]
        } else {
            value = PHASES[Math.trunc(choice / CONST_FOR_GETTING_FIVE_NUMBERS)]
        }
        
        render_text(text + value, TOP_ROW, NO_TIME)
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_value = true
        }
        
    }
    return value
}

//  main menu
function choose_program() {
    let is_menu = true
    let choice = 0
    while (is_menu) {
        choice = pins.analogReadPin(AnalogPin.P0)
        if (choice <= THIRD_OF_MAX_VALUE) {
            render_text("oscilatie simpla", TOP_ROW, NO_TIME)
        } else if (choice <= 2 * THIRD_OF_MAX_VALUE) {
            render_text("fenomen de batai", TOP_ROW, NO_TIME)
        } else if (choice <= MAX_VALUE) {
            render_text("curbe  lissajous", TOP_ROW, NO_TIME)
        }
        
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_menu = false
        }
        
    }
    if (choice <= THIRD_OF_MAX_VALUE) {
        configure_oscilatii_simpla()
    } else if (choice <= 2 * THIRD_OF_MAX_VALUE) {
        configure_fenomen_batai()
    } else if (choice <= MAX_VALUE) {
        configure_curbe_lissajous()
    }
    
}

function configure_curbe_lissajous() {
    let amplitudine1 = set_value("amp1 = ")
    let amplitudine2 = set_value("amp2 = ")
    let frecventa1 = set_from_range("frec1 = ", "FREQUENCE")
    let frecventa2 = set_from_range("frec2 = ", "FREQUENCE")
    let faza1 = set_from_range("faza1 = ", "PHASE")
    let faza2 = set_from_range("faza2 = ", "PHASE")
    let durata = set_value("durata*10 = ")
    curbele_lissajous(amplitudine1, amplitudine2, frecventa1, frecventa2, faza1, faza2, durata)
}

function configure_fenomen_batai() {
    let amplitude = set_value("amp =")
    let frequence1 = set_from_range("frec1 = ", "FREQUENCE")
    let frequence2 = set_from_range("frec2 = ", "FREQUENCE")
    let duration = 10 * set_value("durata*10 = ")
    fenomen_batai(amplitude, frequence1, frequence2, duration)
}

function configure_oscilatii_simpla() {
    let amplitude = set_value("amp = ")
    let frequence = set_from_range("frec = ", "FREQUENCE")
    let duration = set_value("durata*10 = ")
    oscilatie_simpla(amplitude, frequence, duration)
}

function oscilatie_simpla(amplitudine: number, frecventa: number, durata: number) {
    let pin_id: number;
    let timp = 0.01
    while (timp <= durata) {
        pin_id = amplitudine * Math.sin(frecventa * timp)
        datalogger.log(datalogger.createCV("timp", timp), datalogger.createCV("y", pin_id))
        console.log(pin_id)
        pin_id = Math.floor(pin_id)
        pin_id = calculate_pin_id(pin_id)
        draw_pin(pin_id, HIGH)
        pause(REPAUS)
        draw_pin(pin_id, LOW)
        timp += STEP
    }
}

function fenomen_batai(amplitudine: number, frecventa1: number, frecventa2: number, durata: number) {
    let pin_id: number;
    let timp = 0.01
    let dfrec = (frecventa1 - frecventa2) / (2 * Math.PI)
    let frec = (frecventa2 + frecventa1) / 2
    while (timp <= durata) {
        pin_id = 2 * amplitudine * Math.cos(dfrec * timp) * Math.sin(frec * timp)
        datalogger.log(datalogger.createCV("timp", timp), datalogger.createCV("y", pin_id))
        console.log(pin_id)
        plot_point(pin_id)
        timp += STEP
    }
}

function curbele_lissajous(amplitudine1: number, amplitudine2: number, frecventa1: number, frecventa2: number, faza1: number, faza2: number, durata: number) {
    let pin_id1: number;
    let pin_id2: number;
    let timp = 0.01
    while (timp <= durata) {
        pin_id1 = amplitudine1 * Math.sin(frecventa1 * timp + faza1)
        pin_id2 = amplitudine2 * Math.sin(frecventa2 * timp + faza2)
        datalogger.log(datalogger.createCV("timp", pin_id1), datalogger.createCV("y", pin_id2))
        console.log(pin_id1 + " " + pin_id2)
        plot_point(pin_id1)
        timp += STEP
    }
}

// process the values to whole numbers and plots on the leds
function plot_point(pin_id: number) {
    pin_id = Math.floor(pin_id)
    pin_id /= 2
    pin_id = calculate_pin_id(pin_id)
    draw_pin(pin_id, HIGH)
    pause(REPAUS)
    draw_pin(pin_id, LOW)
}

input.onButtonPressed(Button.A, function delete_log() {
    datalogger.deleteLog()
})
init_device()
render_text("screen init ", TOP_ROW, NO_TIME)
render_text("completed", BOTTOM_ROW, 3000)
choose_program()
render_text("program terminat", TOP_ROW, NO_TIME)
