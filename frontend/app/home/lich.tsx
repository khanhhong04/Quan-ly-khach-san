import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter,useLocalSearchParams } from 'expo-router';


const CalendarScreen = () => {
  const params = useLocalSearchParams();
  const today = dayjs().startOf('day'); // Đảm bảo ngày hiện tại được đặt về đầu ngày để so sánh chính xác
  const initialMonth = today.format('YYYY-MM-DD'); // Định dạng ngày hiện tại
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(initialMonth); // Khởi tạo với tháng hiện tại
  const router = useRouter();

  
  
  // Hàm xử lý chọn ngày
  const handleDayPress = (day: DateData) => {
    const selectedDate = dayjs(day.dateString).startOf('day'); // Đảm bảo so sánh chính xác
    const todayDate = dayjs(today).startOf('day');

    // Kiểm tra nếu ngày được chọn nhỏ hơn ngày hiện tại
    if (selectedDate.isBefore(todayDate, 'day')) {
      return; // Không cho phép chọn các ngày trước ngày hiện tại
    }

    if (!checkIn || (checkIn && checkOut)) {
      // Nếu chưa chọn ngày nhận hoặc đã chọn cả ngày nhận và ngày trả, đặt lại ngày nhận
      setCheckIn(day.dateString);
      setCheckOut(null);
    } else if (day.dateString > checkIn) {
      // Nếu đã chọn ngày nhận và ngày được chọn lớn hơn ngày nhận, đặt ngày trả
      setCheckOut(day.dateString);
    } else {
      // Nếu ngày được chọn nhỏ hơn ngày nhận, đặt lại ngày nhận
      setCheckIn(day.dateString);
      setCheckOut(null);
    }
  };

  // Định dạng ngày đã chọn
  const getMarkedDates = () => {
    let markedDates: { [key: string]: { startingDay?: boolean; endingDay?: boolean; color: string; textColor: string; disabled?: boolean; disableTouchEvent?: boolean } } = {};

    // Đánh dấu các ngày trước ngày hiện tại là không thể chọn
    const todayDate = dayjs(today).startOf('day');
    const startOfMonth = dayjs(currentMonth).startOf('month');
    const endOfMonth = dayjs(currentMonth).endOf('month');

    for (let date = startOfMonth; date.isBefore(endOfMonth, 'day') || date.isSame(endOfMonth, 'day'); date = date.add(1, 'day')) {
      if (date.isBefore(todayDate, 'day')) {
        markedDates[date.format('YYYY-MM-DD')] = {
          disabled: true,
          disableTouchEvent: true,
          color: 'transparent', // Thêm color để thỏa mãn kiểu dữ liệu
          textColor: '#d9e1e8', // Màu xám cho các ngày không thể chọn
        };
      }
    }

    if (checkIn) {
      markedDates[checkIn] = { startingDay: true, color: '#4A90E2', textColor: 'white' };
    }

    if (checkOut) {
      markedDates[checkOut] = { endingDay: true, color: '#4A90E2', textColor: 'white' };
      let start = dayjs(checkIn);
      let end = dayjs(checkOut);

      for (let i = 1; i < end.diff(start, 'day'); i++) {
        let date = start.add(i, 'day').format('YYYY-MM-DD');
        markedDates[date] = { color: '#A9D0F5', textColor: 'black' };
      }
    }
    
    return markedDates;
  };

  // Hàm xử lý khi tháng thay đổi
  const handleMonthChange = useCallback((month: DateData) => {
    setCurrentMonth(month.dateString);
  }, []);

  // Hàm xử lý khi nhấn nút chuyển tháng
  const handleArrowPress = (direction: 'left' | 'right') => {
    const current = dayjs(currentMonth);
    let newMonth;

    if (direction === 'left') {
      newMonth = current.subtract(1, 'month');
      // Kiểm tra nếu tháng mới nhỏ hơn tháng hiện tại (không cho phép lùi trước ngày hiện tại)
      if (newMonth.isBefore(today, 'month')) {
        return; // Không cho phép lùi
      }
    } else {
      newMonth = current.add(1, 'month');
    }

    setCurrentMonth(newMonth.format('YYYY-MM-DD'));
  };

  // Tùy chỉnh nút chuyển tháng
  const renderArrow = (direction: 'left' | 'right') => (
    <TouchableOpacity
      style={styles.arrowButton}
      onPress={() => handleArrowPress(direction)}
    >
      <Text style={styles.arrowText}>
        {direction === 'left' ? '«' : '»'}
      </Text>
    </TouchableOpacity>
  );

  // Hàm xử lý khi nhấn nút OK
  const handleConfirm = () => {
    if (checkIn && checkOut) {
      router.push({
        pathname: "/home/datphong",
        params: {
          checkIn,
          checkOut,
          rooms: params.rooms?.toString() || "1",
          adults: params.adults?.toString() || "1",
        },
      });
    } else {
      alert("Vui lòng chọn cả ngày nhận và ngày trả phòng.");
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Thêm khoảng cách phía trên */}
      <View style={styles.spacer} />
      
      <Calendar
        key={currentMonth} // Buộc render lại khi currentMonth thay đổi
        current={currentMonth} // Hiển thị tháng hiện tại
        minDate={today.format('YYYY-MM-DD')} // Chặn chọn ngày trước hôm nay
        markingType={'period'}
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange} // Theo dõi khi tháng thay đổi
        monthFormat={'MMMM yyyy'} // Hiển thị tháng bằng tiếng Việt (VD: Tháng Ba 2025)
        renderArrow={renderArrow} // Tùy chỉnh nút chuyển tháng
        style={styles.calendar} // Thêm style để căn giữa và hiển thị đầy đủ
        theme={{
          monthTextColor: '#4A90E2',
          textMonthFontSize: 20,
          textMonthFontWeight: 'bold',
          calendarBackground: 'white', // Đảm bảo nền trắng
          dayTextColor: '#2d4150', // Màu chữ ngày
          textDisabledColor: '#d9e1e8', // Màu ngày bị vô hiệu hóa
        }}
        disableAllTouchEventsForDisabledDays={true} // Chặn hoàn toàn sự kiện chạm cho các ngày bị vô hiệu hóa
      />

      <Text style={styles.text}>
        {checkIn && checkOut
        
          ? `Bạn đã chọn ${dayjs(checkOut).diff(dayjs(checkIn), 'day')} đêm`
          : 'Chọn ngày nhận và trả phòng'}
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>
          OK ({checkIn && checkOut ? dayjs(checkOut).diff(dayjs(checkIn), 'day') : 0} Đêm)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10, // Giảm padding ngang để lịch hiển thị đầy đủ
  },
  spacer: {
    height: 20, // Khoảng cách phía trên lịch
  },
  calendar: {
    width: '100%', // Đảm bảo lịch chiếm toàn bộ chiều rộng
    alignSelf: 'center', // Căn giữa lịch
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10, // Đảm bảo nút không bị dính sát mép
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 20,
  },
  arrowText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;