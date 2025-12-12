import { call, put, takeLeading } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  FETCH_PRODUCTS_REQUEST,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAILURE,
} from '../actions';
import { setProducts, setProductsLoading, setError } from '../reducers/appReducer';
import { productApi, ProductResponse } from '../apis/productApi';
import { Product } from '../types';

const mapProduct = (p: ProductResponse): Product => ({
  id: p.id,
  name: p.name,
  category: (p.category as 'drink' | 'oden') || 'drink',
  price: p.price,
  description: p.description || '',
  image: p.image,
  is_active: p.is_active,
  customizable: p.customizable,
  customizations: p.customizations?.map((c) => ({
    type: (c.type as 'sugar' | 'ice') || 'sugar',
    name: c.name,
    options: c.options?.map((o) => ({
      id: o.id,
      name: o.name,
      price: o.price_modifier ?? 0,
    })) || [],
  })),
});

function* fetchProductsSaga(_action: PayloadAction<void>) {
  try {
    yield put(setProductsLoading(true));
    yield put(setError(null));

    const data: ProductResponse[] = yield call(productApi.getProducts);
    const active = data.filter((p) => p.is_active !== false);
    const mapped: Product[] = active.map(mapProduct);

    yield put(setProducts(mapped));
    yield put({ type: FETCH_PRODUCTS_SUCCESS, payload: { products: mapped } });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      '無法取得商品列表';
    yield put(setError(message));
    yield put({ type: FETCH_PRODUCTS_FAILURE, payload: { error: message } });
  } finally {
    yield put(setProductsLoading(false));
  }
}

export function* productSaga() {
  // 避免重複觸發造成多次 API 呼叫
  yield takeLeading(FETCH_PRODUCTS_REQUEST, fetchProductsSaga);
}

